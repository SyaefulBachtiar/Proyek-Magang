import { useEffect, useReducer, useRef, useState } from "react";
import { CalendarDays, Captions, MessageSquareText, Paperclip, Pencil, Plus, Save, SquareCheck, Tag, Tags, UserRoundPlus, X } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Proyek from "../Proyek";
import TambahAnggota from "@/modal/Proyek/TambahAnggota";
import Kalender from "@/modal/Proyek/Kalender";
import Label from "@/modal/Proyek/Label";
import Checklist from "@/modal/Proyek/Checklist";

const initialState = {
    tambahAnggota: false,
    checklist: false,
    label: false,
    waktu: false,
    lampiran: false
};

function reducer (state, action) {
    switch (action.type) {
        case "TOGGLE_TAMBAH_ANGGOTA":
            return { ...state, tambahAnggota: !state.tambahAnggota };
        case "TOGGLE_CHECKLIST":
            return { ...state, checklist: !state.checklist };
        case "TOGGLE_LABEL":
            return { ...state, label: !state.label };
        case "TOGGLE_WAKTU":
            return { ...state, waktu: !state.waktu };
        case "TOGGLE_LAMPIRAN":
            return { ...state, lampiran: !state.lampiran}
        default:
            return state;
    }
}


export default function Card_kanban() {
    // user
    const user = usePage().props.auth.user;
    const { role, id_tim, card_id, anggota_card, kalender, label_card, label_tim, id_board, dataCard } = usePage().props;
    const refs = useRef({});
    let date = "";
    let fullDate = "";
    if(kalender){
    date = new Date(kalender.due_date);
    fullDate = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    }

    // REALTIME LISTENER
    useEffect(() => {
        if(!id_board) return;

        // console.log(`Listen ke channel: labelcard.${card_id} dan lebeltim.${id_tim}`);

        // LISTENER UNTUK PERUBAHAN DI BOARD
         const channel = window.Echo.private(`board.${id_board}`);
          channel.listen(".board.updated", (event) => {
            //   console.log(
            //       "Berhasil",
            //       event
            //   );

              // Cukup reload props yang relevan untuk halaman ini.
              router.reload({
                  only: ["label_card", "label_tim", "anggota_card", "kalender"], // sesuaikan dengan props halaman ini
                  preserveState: true,
                  preserveScroll: true,
              });
          });


        return () => {
            window.Echo.leave(`board.${id_board}`);
        }
    }, [id_board]);

    const [state, dispatch] = useReducer(reducer, initialState);

    const buttonFitur = [
        {
            name: "Tambah",
            icon: <Plus size={14} />,
            onclick: () => console.log("Tambah klik"),
            show: true,
            active: "",
        },
        {
            name: "Checklist",
            icon: <SquareCheck size={14} />,
            onclick: () => dispatch({ type: "TOGGLE_CHECKLIST"}),
            show: true,
            active: "",
        },
        {
            name: "Label",
            icon: <Tag size={14} />,
            onclick: () => dispatch({ type: "TOGGLE_LABEL"}),
            show: true,
            active: "",
        },
        {
            name: "Waktu",
            icon: <CalendarDays size={14} />,
            onclick: () => dispatch({ type: "TOGGLE_WAKTU" }),
            show: true,
            active: state.waktu,
        },
        {
            name: "Anggota",
            icon: <UserRoundPlus size={14} />,
            onclick: () => dispatch({ type: "TOGGLE_TAMBAH_ANGGOTA" }),
            show: role !== "Member",
            active: state.tambahAnggota,
        },
        {
            name: "Lampiran",
            icon: <Paperclip size={14} />,
            onclick: () => dispatch({ type: "TOGGLE_LAMPIRAN" }),
            show: true,
            active: state.lampiran,
        },
    ];

    // ref lihat card
    const lihatCardRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                lihatCardRef.current &&
                !lihatCardRef.current.contains(e.target)
            ) {
                  router.visit(
                      route("proyek", {
                          id: user.id,
                          id_tim: id_tim,
                          id_board: id_board,
                      })
                  );
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
                            onClick={() => router.visit(
                                route("proyek", {
                                    id: user.id,
                                    id_tim: id_tim,
                                    id_board: id_board,
                                })
                            )}
                        >
                            <X />
                        </div>
                    </div>

                    {/* Judul */}
                    <div className="pb-2 border-b-2 px-4 border-b-gray-200">
                        <h1 className="font-bold text-xl">{dataCard?.nama_card}</h1>
                    </div>

                    {/* Konten */}
                    <div className="px-4 flex-1 flex flex-col lg:flex-row overflow-y-auto gap-4 ">
                        {/* Konten Kiri */}
                        <div className="flex flex-col gap-4 w-full py-4 lg:w-1/2 border-r-0 lg:border-r-2 border-gray-200 pr-0 lg:pr-4 overflow-y-auto my-scrollable-element">
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
                                {buttonFitur
                                    .filter((btn) => btn.show)
                                    .map((btn, i) => (
                                        <div
                                            ref={(el) =>
                                                (refs.current[btn.name] = el)
                                            }
                                            key={i}
                                            onClick={btn.onclick}
                                            className={`flex gap-2 items-center p-2 ${
                                                btn.active
                                                    ? "bg-gray-600 text-white"
                                                    : "bg-gray-200"
                                            } rounded-md cursor-pointer hover:bg-gray-300`}
                                        >
                                            {btn.icon}
                                            <p>{btn.name}</p>
                                        </div>
                                    ))}

                                {state.tambahAnggota && (
                                    <TambahAnggota
                                        close={() =>
                                            dispatch({
                                                type: "TOGGLE_TAMBAH_ANGGOTA",
                                            })
                                        }
                                        card_id={card_id}
                                        id_tim={id_tim}
                                        refTrigger={refs.current["Anggota"]}
                                    />
                                )}
                                {state.waktu && (
                                    <Kalender
                                        close={() =>
                                            dispatch({ type: "TOGGLE_WAKTU" })
                                        }
                                        refTrigger={refs.current["Waktu"]}
                                        card_id={card_id}
                                    />
                                )}
                                {state.label && (
                                    <Label
                                        close={() =>
                                            dispatch({ type: "TOGGLE_LABEL" })
                                        }
                                        refTrigger={refs.current["Label"]}
                                        card_id={card_id}
                                        id_tim={id_tim}
                                        label_tim_prop={label_tim}
                                        label_card_prop={label_card}
                                    />
                                )}
                                {state.checklist && (
                                    <Checklist 
                                    close={() => dispatch({ type: "TOGGLE_CHECKLIST" })}
                                    card_id={card_id}
                                    refTrigger={refs.current["Checklist"]}
                                    />
                                )}
                            </div>
                            <div
                                className={`${
                                    label_card.length > 0 ? "visible" : "hidden"
                                } mt-4`}
                            >
                                <h1 className="font-semibold text-gray-800">
                                    Label
                                </h1>
                                <div className={`grid grid-cols-5 gap-10`}>
                                    {label_card.length > 0
                                        ? label_card.map((label, i) => (
                                              <div
                                                  key={i}
                                                  className="w-[100px] min-h-[5px] hover:p-2 rounded-md group transition-all ease-in-out duration-150 cursor-pointer "
                                                  style={{
                                                      backgroundColor:
                                                          label.warna,
                                                  }}
                                              >
                                                  <p
                                                      className={`group-hover:flex hidden`}
                                                  >
                                                      {label.title}
                                                  </p>
                                              </div>
                                          ))
                                        : ""}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 mt-4">
                                <h4 className="text-[14px] text-gray-700">
                                    Anggota
                                </h4>

                                <div className="flex gap-1 items-center">
                                    {anggota_card.map((data, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 rounded-full overflow-hidden"
                                        >
                                            {data.image ? (
                                                <img
                                                    src={`/storage/${data.image}`}
                                                    alt={data.name}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-blue-500 flex justify-center items-center text-white text-xs">
                                                    <p>{data.name.charAt(0)}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div className="w-6 h-6 flex justify-center items-center cursor-pointer">
                                        <Plus
                                            onClick={() =>
                                                dispatch({
                                                    type: "TOGGLE_TAMBAH_ANGGOTA",
                                                })
                                            }
                                            size={14}
                                        />
                                    </div>
                                </div>
                            </div>

                            {kalender && (
                                <div className="text-gray-800">
                                    <h1 className="font-semibold">
                                        Tenggat Waktu
                                    </h1>
                                    <div
                                        onClick={() =>
                                            dispatch({
                                                type: "TOGGLE_WAKTU",
                                            })
                                        }
                                        className="flex gap-2 items-center p-2 bg-gray-200 w-fit rounded-md cursor-pointer"
                                    >
                                        <CalendarDays size={20} />
                                        <p>
                                            {fullDate} jam: {kalender.due_time}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* lampilan */}
                            <div className="border border-gray-200 py-3 px-2 rounded-md mt-4">
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