import { CircleAlert } from "lucide-react";

export default function WarningKomponent ({ children, submit, close}) {
    return (
        <div className="absolute top-0 w-screen h-screen flex justify-center items-center z-50">
            <div className="max-w-52 flex items-start gap-4 p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
                <div className="flex-shrink-0 mt-0.5">
                    <CircleAlert className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}