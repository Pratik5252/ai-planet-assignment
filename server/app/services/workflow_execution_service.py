# app/services/workflow_execution_service.py
from typing import Dict, List, Any, Optional
from sqlmodel import Session
from datetime import datetime, timezone
import json

from app.database import get_session
from app.models.workflow import Workflow
from .knowledge_service import retrieve_context
from .llm_service import generate_response
from .document_service import process_docs


class WorkflowExecutor:
    """Flexible ReactFlow workflow execution engine"""

    def __init__(self, workflow: Workflow):
        self.workflow = workflow
        self.nodes = {node["id"]: node for node in (workflow.nodes or [])}
        self.edges = workflow.edges or []
        self.execution_state = {}
        self.execution_log = []

        # Build execution graph
        self.graph = self._build_execution_graph()

    def execute(self, user_input: str) -> Dict[str, Any]:
        """Execute the complete ReactFlow workflow with flexible routing"""
        try:
            self.log(f"🚀 Starting workflow: {self.workflow.name}")
            self.log(f"📝 User input: {user_input}")

            # Initialize execution state
            self.execution_state = {
                "user_query": user_input,
                "context": None,
                "llm_response": None,
                "final_output": None,
                "knowledge_processed": False,
                "documents_uploaded": False,
                "nodes_executed": [],
            }

            # Analyze workflow pattern
            workflow_pattern = self._analyze_workflow_pattern()
            self.log(f"🔄 Detected pattern: {workflow_pattern}")

            # Get execution order based on ReactFlow connections
            execution_order = self._get_execution_order()
            self.log(
                f"📋 Execution order: {[self._get_node_label(nid) for nid in execution_order]}"
            )

            # Execute nodes in correct order
            for node_id in execution_order:
                if node_id not in self.nodes:
                    continue

                node = self.nodes[node_id]
                node_type = node.get("type")
                node_label = self._get_node_label(node_id)

                self.log(f"⚡ Executing: {node_label} ({node_type})")

                # Execute based on node type
                success = self._execute_node(node_id, node)

                if success:
                    self.execution_state["nodes_executed"].append(node_id)
                    self.log(f"✅ {node_label} completed successfully")
                else:
                    self.log(f"⚠️ {node_label} failed, continuing with workflow...")

            # Format final result
            return {
                "success": True,
                "workflow_id": self.workflow.id,
                "workflow_name": self.workflow.name,
                "user_query": user_input,
                "final_response": self.execution_state.get(
                    "final_output", "No response generated"
                ),
                "context_used": self.execution_state.get("context") is not None,
                "knowledge_processed": self.execution_state.get(
                    "knowledge_processed", False
                ),
                "workflow_pattern": workflow_pattern,
                "nodes_executed": len(self.execution_state["nodes_executed"]),
                "execution_log": self.execution_log,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        except Exception as e:
            self.log(f"💥 Execution failed: {str(e)}")
            return {
                "success": False,
                "workflow_id": self.workflow.id,
                "error": str(e),
                "execution_log": self.execution_log,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

    def _analyze_workflow_pattern(self) -> str:
        """Analyze the workflow pattern to understand the flow"""
        node_types = [node.get("type") for node in self.nodes.values()]

        has_user_query = "userQuery" in node_types
        has_knowledge = "knowledgeBase" in node_types
        has_llm = "llmEngine" in node_types
        has_output = "output" in node_types

        # Check if UserQuery connects directly to LLM (skipping KnowledgeBase)
        user_query_node = None
        llm_node = None
        knowledge_node = None

        for node_id, node in self.nodes.items():
            if node.get("type") == "userQuery":
                user_query_node = node_id
            elif node.get("type") == "llmEngine":
                llm_node = node_id
            elif node.get("type") == "knowledgeBase":
                knowledge_node = node_id

        # Check connections
        direct_to_llm = False
        through_knowledge = False

        if user_query_node and llm_node:
            # Check if UserQuery connects directly to LLM
            for edge in self.edges:
                if (
                    edge.get("source") == user_query_node
                    and edge.get("target") == llm_node
                ):
                    direct_to_llm = True
                elif (
                    edge.get("source") == user_query_node
                    and edge.get("target") == knowledge_node
                ):
                    through_knowledge = True

        if has_user_query and has_knowledge and has_llm and has_output:
            if through_knowledge and not direct_to_llm:
                return "Full RAG Pipeline (UserQuery → KnowledgeBase → LLM → Output)"
            elif direct_to_llm and through_knowledge:
                return "Hybrid Pipeline (UserQuery → KnowledgeBase + LLM → Output)"
            elif direct_to_llm and not through_knowledge:
                return "Direct LLM Pipeline (UserQuery → LLM → Output)"
        elif has_user_query and has_llm and has_output and not has_knowledge:
            return "Simple LLM Pipeline (UserQuery → LLM → Output)"
        else:
            return "Custom Pipeline"

    def _build_execution_graph(self) -> Dict[str, List[str]]:
        """Build adjacency list from ReactFlow edges"""
        graph = {}

        # Initialize all nodes
        for node_id in self.nodes:
            graph[node_id] = []

        # Add edges
        for edge in self.edges:
            source = edge.get("source")
            target = edge.get("target")
            if source and target and source in graph:
                graph[source].append(target)

        return graph

    def _get_execution_order(self) -> List[str]:
        """Get nodes in execution order using topological sort"""
        # Find UserQuery node as starting point
        start_node = None
        for node_id, node in self.nodes.items():
            if node.get("type") == "userQuery":
                start_node = node_id
                break

        if not start_node:
            # Fallback: execute by type order
            type_order = ["userQuery", "knowledgeBase", "llmEngine", "output"]
            order = []
            for node_type in type_order:
                for node_id, node in self.nodes.items():
                    if node.get("type") == node_type:
                        order.append(node_id)
            return order

        # DFS traversal from UserQuery
        visited = set()
        order = []

        def dfs(node_id):
            if node_id in visited or node_id not in self.nodes:
                return
            visited.add(node_id)
            order.append(node_id)

            # Visit connected nodes
            for neighbor in self.graph.get(node_id, []):
                dfs(neighbor)

        dfs(start_node)

        # Add any unvisited nodes
        for node_id in self.nodes:
            if node_id not in visited:
                order.append(node_id)

        return order

    def _get_node_label(self, node_id: str) -> str:
        """Get a readable label for a node"""
        if node_id not in self.nodes:
            return node_id

        node = self.nodes[node_id]
        label = node.get("data", {}).get("label")
        if label:
            return label

        node_type = node.get("type", "unknown")
        type_labels = {
            "userQuery": "User Query",
            "knowledgeBase": "Knowledge Base",
            "llmEngine": "LLM Engine",
            "output": "Output",
        }
        return type_labels.get(node_type, node_type)

    def _execute_node(self, node_id: str, node: Dict) -> bool:
        """Execute a single node based on its type"""
        node_type = node.get("type")

        try:
            if node_type == "userQuery":
                return self._execute_user_query_node(node)
            elif node_type == "knowledgeBase":
                return self._execute_knowledge_base_node(node)
            elif node_type == "llmEngine":
                return self._execute_llm_engine_node(node)
            elif node_type == "output":
                return self._execute_output_node(node)
            else:
                self.log(f"⚠️ Unknown node type: {node_type}")
                return False

        except Exception as e:
            self.log(f"❌ Node {node_id} error: {str(e)}")
            return False

    def _execute_user_query_node(self, node: Dict) -> bool:
        """Execute User Query component"""
        self.log("📝 Processing user query...")

        # Get any additional configuration from the node
        config = node.get("data", {}).get("config", {})

        # User query is already stored in execution_state
        user_query = self.execution_state["user_query"]

        # Apply any query transformations from node config
        if config.get("preprocess", False):
            user_query = user_query.strip().lower()
            self.execution_state["user_query"] = user_query
            self.log(f"📝 Query preprocessed: {user_query}")

        self.log("✅ User query processed successfully")
        return True

    def _execute_knowledge_base_node(self, node: Dict) -> bool:
        """Execute Knowledge Base component - handle PDF uploads and context retrieval"""
        self.log("📚 Processing knowledge base...")

        try:
            config = node.get("data", {}).get("config", {})

            # Get API key and embedding model from user input
            api_key = config.get("api-key", "").strip()
            embedding_model = config.get("embedding-model", "text-embedding-3-small")

            self.log(f"🔍 Debug KB - Config keys: {list(config.keys())}")
            self.log(
                f"🔍 Debug KB - Raw API key from config: '{config.get('api-key')}'"
            )
            self.log(f"🔍 Debug KB - Stripped API key: '{api_key}'")

            if not api_key:
                self.log(
                    "❌ No API key provided for knowledge base. This is required for user-driven API key approach."
                )
                api_key = None
            else:
                self.log(
                    f"🔑 Using provided API key for embeddings with model: {embedding_model}"
                )

            # Check if documents are uploaded for this node
            has_files = config.get("hasFiles", False)
            uploaded_files = config.get("uploadedFiles", [])

            if has_files and uploaded_files:
                self.log(f"📄 Processing {len(uploaded_files)} uploaded documents...")

                # Process each uploaded file using document_service
                for file_info in uploaded_files:
                    file_path = file_info.get("path")
                    file_name = file_info.get("name", "unknown")

                    if file_path:
                        try:
                            # Process PDF and add to vector store with API key
                            success = process_docs(file_path, api_key, embedding_model)
                            if success:
                                self.log(f"📄 Successfully processed {file_name}")
                            else:
                                self.log(f"⚠️ Failed to process {file_name}")
                        except Exception as e:
                            self.log(f"❌ Failed to process {file_name}: {str(e)}")

                self.execution_state["documents_uploaded"] = True
                self.log(f"💾 Documents processed and stored in vector database")

            # Retrieve relevant context based on user query
            user_query = self.execution_state["user_query"]
            self.log(f"🔍 Searching for relevant context for: {user_query}")

            context = retrieve_context(
                user_query, api_key=api_key, embedding_model=embedding_model
            )

            if context and context != "No relevant context found.":
                self.execution_state["context"] = context
                self.execution_state["knowledge_processed"] = True
                # Store API key for LLM to use if needed
                self.execution_state["kb_api_key"] = api_key
                self.execution_state["embedding_model"] = embedding_model
                context_preview = (
                    context[:200] + "..." if len(context) > 200 else context
                )
                self.log(f"✅ Context retrieved: {context_preview}")
            else:
                self.log("⚠️ No relevant context found")
                self.execution_state["context"] = None

            return True

        except Exception as e:
            self.log(f"❌ Knowledge base error: {str(e)}")
            return False

    def _execute_llm_engine_node(self, node: Dict) -> bool:
        """Execute LLM Engine component - generate response using query + context (if available)"""
        self.log("🤖 Generating LLM response...")

        try:
            config = node.get("data", {}).get("config", {})

            # Get inputs
            user_query = self.execution_state["user_query"]
            context = self.execution_state.get(
                "context"
            )  # May be None if no KnowledgeBase

            # Get LLM configuration from user input
            model = config.get("model", "gpt-4o-mini")
            temperature = float(config.get("temperature", 0.7))
            custom_prompt = config.get("prompt")
            api_key = config.get("api-key", "").strip()

            self.log(f"🔍 Debug - Config keys: {list(config.keys())}")
            self.log(f"🔍 Debug - Raw API key from config: '{config.get('api-key')}'")
            self.log(f"🔍 Debug - Stripped API key: '{api_key}'")

            # If no API key provided in LLM node, try to use from knowledge base
            if not api_key:
                api_key = self.execution_state.get("kb_api_key")
                if not api_key:
                    self.log(
                        "❌ No API key provided for LLM. This is required for user-driven API key approach."
                    )
                    api_key = None
                else:
                    self.log("🔑 Using API key from Knowledge Base component")
            else:
                self.log("🔑 Using API key from LLM Engine component")

            self.log(f"🤖 Using model: {model}, temperature: {temperature}")

            if context:
                self.log(f"📚 Using context: {len(context)} characters")
            else:
                self.log("📝 No context available - direct query to LLM")

            # Generate response with API key
            response = generate_response(
                query=user_query,
                context=context,  # Pass None if no context available
                custom_prompt=custom_prompt,
                api_key=api_key,
                model=model,
                temperature=temperature,
            )

            if response and not response.startswith("Error:"):
                self.execution_state["llm_response"] = response
                response_preview = (
                    response[:200] + "..." if len(response) > 200 else response
                )
                self.log(f"✅ LLM response: {response_preview}")
                return True
            else:
                self.log(f"❌ LLM error: {response}")
                self.execution_state["llm_response"] = (
                    response
                    or "I'm sorry, I couldn't generate a response to your query."
                )
                return False

        except Exception as e:
            self.log(f"❌ LLM engine error: {str(e)}")
            # Set fallback response
            self.execution_state["llm_response"] = (
                f"Sorry, I encountered an error: {str(e)}"
            )
            return False

    def _execute_output_node(self, node: Dict) -> bool:
        """Execute Output component - format and display final response"""
        self.log("📤 Formatting output...")

        try:
            config = node.get("data", {}).get("config", {})

            # Get the LLM response
            llm_response = self.execution_state.get("llm_response")
            user_query = self.execution_state.get("user_query")
            context_used = self.execution_state.get("context") is not None

            # Format final output
            if llm_response:
                final_output = llm_response
            else:
                # Fallback if no LLM response
                final_output = f"Echo: {user_query}"

            # Add metadata if configured
            if config.get("includeMetadata", False):
                metadata = {
                    "context_used": context_used,
                    "knowledge_processed": self.execution_state.get(
                        "knowledge_processed", False
                    ),
                    "documents_uploaded": self.execution_state.get(
                        "documents_uploaded", False
                    ),
                }
                final_output = {"response": final_output, "metadata": metadata}

            self.execution_state["final_output"] = final_output
            self.log("✅ Output formatted successfully")
            return True

        except Exception as e:
            self.log(f"❌ Output formatting error: {str(e)}")
            self.execution_state["final_output"] = f"Output error: {str(e)}"
            return False

    def log(self, message: str):
        """Add message to execution log with timestamp"""
        timestamp = datetime.now(timezone.utc).strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        self.execution_log.append(log_entry)
        print(log_entry)  # Also print to console for debugging


# Public API functions
def execute_workflow(workflow_id: int, user_input: str) -> Dict[str, Any]:
    """
    Execute a ReactFlow workflow with user input
    This is the main function called by the API
    """
    session = None
    try:
        session = get_session()
        workflow = session.get(Workflow, workflow_id)

        if not workflow:
            return {
                "success": False,
                "error": f"Workflow {workflow_id} not found",
                "workflow_id": workflow_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        # Check if workflow has nodes
        if not workflow.nodes:
            return {
                "success": False,
                "error": "Workflow has no nodes to execute",
                "workflow_id": workflow_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        # Execute the workflow
        executor = WorkflowExecutor(workflow)
        result = executor.execute(user_input)

        return result

    except Exception as e:
        return {
            "success": False,
            "error": f"Execution failed: {str(e)}",
            "workflow_id": workflow_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    finally:
        if session:
            session.close()
