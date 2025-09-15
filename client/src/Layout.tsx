import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { DnDProvider } from './DnDContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <DnDProvider>
                <div className="flex overflow-hidden h-screen">
                    <AppSidebar />
                    <main className="flex-1">{children}</main>
                </div>
            </DnDProvider>
        </SidebarProvider>
    );
}
