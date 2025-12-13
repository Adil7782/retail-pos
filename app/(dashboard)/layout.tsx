import DashboardLayout from "../components/DashboardLayout";
import Sidebar from "../components/Sidebar";


const DashboardLayouts = ({
    children
}: {
    children: React.ReactNode;
}) => {



    return (
        <div className="h-screen w-full">
            <DashboardLayout>
                <main className="dashboard-body-height px-4">
                    {children}
                </main>
            </DashboardLayout>

        </div>
    )
}

export default DashboardLayouts;