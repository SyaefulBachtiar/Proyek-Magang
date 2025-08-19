import { useEffect, useRef, useState } from "react";
import { CalendarDays, Captions, MessageSquareText, Paperclip, Pencil, Plus, Save, SquareCheck, Tags, UserRoundPlus, X } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Proyek from "../Proyek";
import Input from "@/modal/input/Input";
import TambahAnggota from "@/modal/Proyek/TambahAnggota";

export default function Card_kanban() {
    // user
    const user = usePage().props.auth.user;
    const { role, id_tim, card_id } = usePage().props;
    const [tambahAnggota, setTambahAnggota] = useState(false);

    // ref lihat card
    const lihatCardRef = useRef(null);

    // useEffect(() => {
    //     function handleClickOutside(e) {
    //         if (
    //             lihatCardRef.current &&
    //             !lihatCardRef.current.contains(e.target)
    //         ) {
    //             onClose();
    //         }
    //     }
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, [onClose]);

    // State untuk toggle dan isi deskripsi
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sint hic veritatis sapiente!"
    );

    // ✅ State baru untuk komentar
    const [isCommenting, setIsCommenting] = useState(false);
    const [comment, setComment] = useState("");

    // ✅ Fungsi untuk menyimpan komentar (placeholder)
    const handleSaveComment = () => {
        if (!comment) return; // Jangan simpan jika kosong
        console.log("Komentar disimpan:", comment);
        // Di sini Anda akan mengirim 'comment' ke backend
        // Setelah berhasil, reset state
        setComment("");
        setIsCommenting(false);
    };


    return (
        <Proyek>
            <div className="w-screen h-screen fixed top-0 left-0 bg-black/20 flex justify-center items-center z-50">
                <div
                    ref={lihatCardRef}
                    className="rounded-xl bg-white w-full max-w-[90%] h-auto max-h-[95vh] lg:w-[80%] lg:h-[90%] flex flex-col overflow-hidden"
                >
                    {/* Close Button */}
                    <div className="flex justify-end p-1 m-2">
                        <div
                            className="p-1 hover:bg-black/20 rounded-md cursor-pointer"
                            onClick={() => window.history.back()}
                        >
                            <X />
                        </div>
                    </div>

                    {/* Judul */}
                    <div className="pb-2 border-b-2 px-4 border-b-gray-200">
                        <h1 className="font-bold text-xl">Judul/Title</h1>
                    </div>

                    {/* Konten */}
                    <div className="px-4 flex-1 flex flex-col lg:flex-row overflow-y-auto gap-4 ">
                        {/* Konten Kiri */}
                        <div className="flex flex-col gap-4 w-full py-4 lg:w-1/2 border-r-0 lg:border-r-2 border-gray-200 pr-0 lg:pr-4 overflow-y-auto my-scrollable-element">
                            {/* Avatar
                            <div className="flex gap-2 items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                    <p>{user.name.charAt(0)}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-lg">
                                        {user.name}
                                    </p>
                                    <p className="p-1 bg-gray-200 rounded-md text-sm">
                                        2 jam yang lalu
                                    </p>
                                </div>
                            </div> */}

                            {/* Deskripsi */}
                            <div className="px-2 border border-gray-200 py-3 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex gap-2 items-center">
                                        <Captions />
                                        <h1 className="font-bold text-xl">
                                            Deskripsi
                                        </h1>
                                    </div>
                                    {!isEditing ? (
                                        <div
                                            onClick={() => setIsEditing(true)}
                                            className="flex gap-2 items-center p-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
                                        >
                                            <Pencil size={14} />
                                            <p className="text-sm">Edit</p>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setIsEditing(false)}
                                            className="flex gap-2 items-center p-2 bg-green-200 rounded-lg hover:bg-green-300 cursor-pointer"
                                        >
                                            <Save size={14} />
                                            <p className="text-sm">Simpan</p>
                                        </div>
                                    )}
                                </div>

                                {/* Isi Deskripsi */}
                                <div className="mt-2 px-1">
                                    {isEditing ? (
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={description}
                                            onChange={(event, editor) => {
                                                const data = editor.getData();
                                                setDescription(data);
                                            }}
                                        />
                                    ) : (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: description,
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex gap-3 mt-4 text-sm flex-wrap relative">
                                {/* button pilihan */}
                                <div className="flex gap-2 items-center p-2 rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300">
                                    <Plus size={14} />
                                    Tambah
                                </div>

                                {/* button tambah anggota */}
                                {role !== 'Member' ? (
                                <div
                                    onClick={() =>
                                        setTambahAnggota(!tambahAnggota)
                                    }
                                    className={`flex gap-2 items-center p-2 ${
                                        tambahAnggota
                                            ? "bg-gray-600 text-white"
                                            : "bg-gray-200"
                                    } rounded-md cursor-pointer hover:bg-gray-300`}
                                >
                                    <UserRoundPlus size={14} />
                                    <p>Anggota</p>
                                </div>
                                ) : ""}

                                {tambahAnggota && (
                                    <TambahAnggota
                                        close={() => setTambahAnggota(false)}
                                        card_id={card_id}
                                        id_tim={id_tim}
                                    />
                                )}

                                {/* button checklist */}
                                <div className="flex gap-2 items-center p-2 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300">
                                    <SquareCheck size={14} />
                                    <p>Checklist</p>
                                </div>

                                {/* button label */}
                                <div className="flex gap-2 items-center p-2 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300">
                                    <Tags size={14} />
                                    <p>Label</p>
                                </div>

                                {/* button tanggal */}
                                <div className="flex gap-2 items-center p-2 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300">
                                    <CalendarDays size={14} />
                                    <p>Waktu</p>
                                </div>
                            </div>

                            {/* lampilan */}
                            <div className="border border-gray-200 py-3 px-2 rounded-md">
                                <div className="flex items-center gap-2">
                                    <Paperclip size={14} />
                                    <h1>Lampiran</h1>
                                </div>

                                <div className="w-[200px] h-[200px] flex justify-center items-center px-4">
                                    <img
                                        src="/img/img_proyek.png"
                                        alt="lampiran"
                                        className="w-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Konten Kanan */}
                        <div className="w-full lg:w-1/2 px-0 lg:px-4 my-4 ">
                            <div className="flex gap-2 items-center mb-4">
                                <MessageSquareText />
                                <p className="font-bold text-lg">Komentar</p>
                            </div>

                            {!isCommenting ? (
                                <div
                                    onClick={() => setIsCommenting(true)}
                                    className="mt-2 p-3 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer text-gray-500"
                                >
                                    <p>Tulis komentar...</p>
                                </div>
                            ) : (
                                <div>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={comment}
                                        onChange={(event, editor) =>
                                            setComment(editor.getData())
                                        }
                                    />
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={handleSaveComment}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Simpan
                                        </button>
                                        <button
                                            onClick={() =>
                                                setIsCommenting(false)
                                            }
                                            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Komentar */}
                            <div className="mt-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 mt-1 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                                        A
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">Angga</p>
                                        <div className="prose prose-sm max-w-none bg-gray-100 p-2 rounded-md">
                                            <p>
                                                Ini adalah contoh komentar yang
                                                sudah ada.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Proyek>
    );
}