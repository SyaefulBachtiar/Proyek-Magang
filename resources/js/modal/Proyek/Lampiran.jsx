import { File, FileText, Upload, X } from "lucide-react";
import { useEffect, useReducer, useRef } from "react";

const initialState = {
    file: null,
    filePreview: null,
    title: "",
    deskripsi: "",
    loading: false,
}

function reducer (state, action) {
    switch(action.type){
        case "SET_FILE":
            return {...state, 
                    file: action.payload.file,
                    filePreview: action.payload.filePreview}
        case "SET_TITLE":
            return {...state, title: action.payload}
        case "SET_DESKRIPSI":
            return {...state, deskripsi: action.payload}
        case "RESET_FORM":
            return initialState;
        case "LOADING":
            return {...state, loading: action.payload}
        default:
            throw new Error('Gagagl meyimpan');
    }
}

export default function Lampiran({ close, card_id, id_tim, refTrigger }) {
    const modalRef = useRef(null);

    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        function handleClickOutside (e) {
            if(modalRef.current && !modalRef.current.contains(e.target) && refTrigger && !refTrigger.contains(e.target)){
                close();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [modalRef, refTrigger]);

    const handleSubmit = () => {

    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file){
            const preview = URL.createObjectURL(file);
            dispatch({
                type: "SET_FILE",
                payload: { file, filePreview: preview },
            });
        }
    }

    return (
        <div
            ref={modalRef}
            className="w-80 absolute top-24 right-36 bg-white rounded-lg border shadow-[0_5px_10px_rgba(0,0,0,0.25)]"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-medium text-black">Checklist</h2>
                <X
                    onClick={close}
                    className="cursor-pointer hover:bg-gray-100 rounded p-1"
                    size={20}
                />
            </div>
            <form onSubmit={handleSubmit} className="p-4 w-full">
                <div className="w-full">
                    <label
                        htmlFor="file_lampiran"
                        className="cursor-pointer p-2 bg-blue-500 rounded w-full text-center font-semibold text-gray-100 flex items-center justify-center gap-2"
                    >
                        <Upload size={16} />
                        <span>Upload</span>
                    </label>
                    <input
                        type="file"
                        id="file_lampiran"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
                {state.filePreview && (
                    <div className="mt-4 flex justify-center items-center w-full">
                        <a 
                        href={state.filePreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                            {state.file.type.startsWith("image/") ? (
                                <img
                                    src={state.filePreview}
                                    alt="Pertinjau file"
                                />
                            ) : state.file.type === "application/pdf" ? (
                                <div className="flex items-center gap-2 border border-gray-300 rounded p-2 cursor-pointer">
                                    <div className="text-center">
                                        <FileText
                                            className="text-red-500"
                                            size={24}
                                        />
                                        <span className="font-bold text-gray-800 text-xs">
                                            {state.file.type.split("/")[1]}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800">
                                            {state.file.name}
                                        </span>
                                        <span className="text-gray-800 text-xs">
                                            {(state.file.size / 1024).toFixed(
                                                2
                                            )}{" "}
                                            KB
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-800 border border-gray-300 py-2 px-4 rounded cursor-pointer">
                                    <div>
                                        <File
                                            className="text-gray-500"
                                            size={24}
                                        />
                                        {state.file.type.split("/")[1]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold">
                                            {state.file.name}
                                        </span>
                                        <span className="text-xs">
                                            {(state.file.size / 1024).toFixed(
                                                2
                                            )}{" "}
                                            KB
                                        </span>
                                    </div>
                                </div>
                            )}
                        </a>
                    </div>
                )}
                <div className="w-full mt-4">
                    <label className="block text-gray-800 font-semibold">
                        Judul
                    </label>
                    <input
                        type="text"
                        className="w-full rounded h-10"
                        placeholder="Judul.."
                    />
                </div>
                <div className="mt-4">
                    <label className="block text-gray-800 font-semibold">
                        Deskripsi
                    </label>
                    <textarea
                        name=""
                        className="w-full rounded resize-none h-28"
                        placeholder="Deskripsi..."
                    ></textarea>
                </div>
            </form>
        </div>
    );
}