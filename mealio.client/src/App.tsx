import AppRoutes from "./routes/AppRoutes";

export default function App() {
    return (
        <div style={{ height: "100dvh" }} className="flex flex-col">
            <main className="flex-1 flex flex-col min-h-0">
                <AppRoutes />
            </main>
        </div>
    );
}