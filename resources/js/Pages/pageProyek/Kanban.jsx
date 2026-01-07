import { Head, router, usePage, Link } from "@inertiajs/react";
import {
    Clock,
    Ellipsis,
    Pencil,
    Plus,
    SquareCheckBig,
    Trash,
    Archive,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Proyek from "../Proyek";
import TambahCard from "@/modal/Proyek/TambahCard";
import TambahList from "@/modal/Proyek/TambahList";
import TooltipAnggotaCard from "@/Components/TooltipAnggotaCard";
import Notification from "@/Components/Notification";

const mapBoardData = (boardData) => {
    if (!boardData) return [];
    return boardData.map((list) => ({
        id: list.id.toString(),
        title: list.judul,
        cards: list.cards.map((card) => ({
            id: card.id.toString(),
            title: card.nama_card,
            image: card.image,
            jumlah_checklist: card.checklist_card_count || 0,
            checklist_selesai: card.completed_checklist_count || 0,
            anggota:
                card.anggota_card_list?.map((ang) => ({
                    id: ang.id,
                    id_user: ang.id_user,
                    id_anggota_tim: ang.id_anggota_tim,
                    user: ang.user
                        ? {
                              id: ang.user.id,
                              name: ang.user.name,
                              email: ang.user.email,
                              image: ang.user.poto_profile_user,
                          }
                        : null,
                })) || [],
            label:
                card.label_card?.map((lab) => ({
                    id: lab.id,
                    title: lab.title,
                    warna: lab.warna,
                })) || [],
            kalender: card.kalender ? [card.kalender] : [],
        })),
    }));
};

export default function Kanban({ children, dashboardId, activePage, tim, dataBoard, id_tim, currentUserRole }) {
    const user = usePage().props.auth.user;
    const { id_board } = usePage().props;

    const [tambahCard, setTambahCard] = useState("");
    const [tambahList, setTambahList] = useState(false);
    const [lists, setLists] = useState([]);
    const [editingListId, setEditingListId] = useState(null);
    const memberRef = useRef({});

    const [activeMenuCardId, setActiveMenuCardId] = useState(null);
    const menuRef = useRef(null);

    const [hoveredAnggota, setHoverdAnggota] = useState(null);
    const hoveredAnggotaRef = useRef(null);
    const notificationTimer = useRef(null);
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "error",
    });

    // Warna background list yang lebih jelas (seperti request sebelumnya)
    const listColors = [
        "bg-sky-500/20",      // Biru Langit
        "bg-green-500/20",    // Hijau
        "bg-amber-500/20",    // Kuning/Oranye
        "bg-pink-500/20",     // Pink
        "bg-purple-500/20",   // Ungu
        "bg-teal-500/20",     // Teal/Tosca
        "bg-indigo-500/20",   // Indigo
    ];

    useEffect(() => {
        setLists(mapBoardData(dataBoard));
    }, [dataBoard]);

    useEffect(() => {
        if (id_board) {
            const channel = window.Echo.private(`board.${id_board}`);

            channel.listen('.board.updated', (event) => {
                router.reload({
                    only: ["dataBoard"]
                });
            });

            return () => {
                window.Echo.leave(`board.${id_board}`);
            };
        }
    }, [id_board]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuCardId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const handleDragEnd = async (result) => {
        const { source, destination, type } = result;
        if (!destination) return;

        if (type === "card" && currentUserRole === 'Member') {
            const sourceList = lists.find(list => list.id === source.droppableId);
            const destList = lists.find(list => list.id === destination.droppableId);

            if (sourceList.title === 'Perlu Verifikasi') {
                alert('Anda tidak diizinkan memindahkan tugas dari list verifikasi.');
                return;
            }

            if (sourceList.title === 'Selesai') {
                alert('Anda tidak dapat memindahkan tugas yang sudah selesai.');
                return;
            }

            if (destList.title === 'Selesai') {
                alert('Hanya ketua tim yang dapat menyelesaikan tugas.');
                return;
            }
        }

        if (type === "list") {
            const reorderedLists = Array.from(lists);
            const [removed] = reorderedLists.splice(source.index, 1);
            reorderedLists.splice(destination.index, 0, removed);
            setLists(reorderedLists);

            const updatedLists = reorderedLists.map((list, index) => ({
                id: list.id,
                urutan_posisi: index + 1,
            }));

            try {
                await router.post(
                    route("proyek.update-list-order", { id: user.id }),
                    {
                        lists: updatedLists,
                        id_board: id_board,
                        id_tim: id_tim,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        only: [],
                    }
                );
            } catch (error) {
                console.error("Error updating list order:", error);
            }
        }

        if (type === "card") {
            const sourceListIndex = lists.findIndex(
                (list) => list.id === source.droppableId
            );
            const destListIndex = lists.findIndex(
                (list) => list.id === destination.droppableId
            );

            const sourceCards = Array.from(lists[sourceListIndex].cards);
            const destCards = Array.from(lists[destListIndex].cards);
            const [movedCard] = sourceCards.splice(source.index, 1);

            let updatedCards = [];

            if (sourceListIndex === destListIndex) {
                sourceCards.splice(destination.index, 0, movedCard);
                const newLists = [...lists];
                newLists[sourceListIndex].cards = sourceCards;
                setLists(newLists);

                updatedCards = sourceCards.map((card, index) => ({
                    id: card.id,
                    urutan: index + 1,
                    id_list: source.droppableId,
                }));
            } else {
                destCards.splice(destination.index, 0, movedCard);
                const newLists = [...lists];
                newLists[sourceListIndex].cards = sourceCards;
                newLists[destListIndex].cards = destCards;
                setLists(newLists);

                const sourceUpdates = sourceCards.map((card, index) => ({
                    id: card.id,
                    urutan: index + 1,
                    id_list: source.droppableId,
                }));

                const destUpdates = destCards.map((card, index) => ({
                    id: card.id,
                    urutan: index + 1,
                    id_list: destination.droppableId,
                }));

                updatedCards = [...sourceUpdates, ...destUpdates];
            }

            try {
                await router.post(
                    route("proyek.update-card-order", { id: user.id }),
                    {
                        cards: updatedCards,
                        id_board: id_board,
                        id_tim: id_tim,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        only: [],
                        progress: false
                    }
                );
            } catch (error) {
                console.error("Error updating card order:", error);
            }
        }
    };

    const handleAddCard = (listId) => {
        setTambahCard(listId);
    };

    const handleUpdateListTitle = (listId, newTitle) => {
        const originalLists = [...lists];
        setLists((prev) =>
            prev.map((list) =>
                list.id === listId ? { ...list, title: newTitle } : list
            )
        );
        setEditingListId(null);

        router.put(
            route("proyek.list.update.title", {
                id: user.id,
                id_list: listId,
            }),
            {
                judul: newTitle,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    setLists(originalLists);
                },
            }
        );
    };

    const handleDeleteList = (listId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus list ini? Semua tugas di dalamnya juga akan terhapus secara permanen.')) {
            router.delete(route('proyek.list.destroy', { id: dashboardId, id_list: listId }), {
                data: { id_tim: id_tim },
                preserveScroll: true,
            });
        }
    };

    const handleLihatCard = (cardId) => {
        router.visit(
            route("proyek.card", {
                id: dashboardId,
                cardId: cardId,
                id_tim: tim.id,
            })
        );
    };

    const showNotification = (message, type = "error", duration = 3000) => {
        if (notificationTimer.current) {
            clearTimeout(notificationTimer.current);
        }
        setNotification({ show: true, message, type });
        notificationTimer.current = setTimeout(() => {
            setNotification({ show: false, message: "", type: "" });
        }, duration);
    };

    const handleCardClick = (card) => {
        const isMember = card.anggota.some(
            (ang) => ang.user && ang.user.id === user.id
        );

        if (isMember) {
            handleLihatCard(card.id);
        } else {
            showNotification(
                "Maaf, Anda belum ditambahkan ke tugas ini.",
                "error"
            );
        }
    };

    const handleArchiveCard = (cardId) => {
        router.put(route('proyek.card.archive', { id: user.id, cardId }), {}, {
            preserveScroll: true,
            onSuccess: () => setActiveMenuCardId(null),
        });
    };

    const handleDeleteCard = (cardId) => {
        if (confirm("Anda yakin ingin menghapus tugas ini secara permanen?")) {
            router.delete(route('proyek.card.delete', { id: user.id, cardId }), {
                preserveScroll: true,
                onSuccess: () => setActiveMenuCardId(null),
            });
        }
    };

    return (
        <>
            <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
                <Head title="Board Proyek" />
                {/* Main Kanban Container */}
                <div className="h-full w-full bg-slate-50 rounded-xl overflow-hidden relative flex flex-col border border-slate-200">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable
                            droppableId="all-lists"
                            direction="horizontal"
                            type="list"
                        >
                            {(provided) => (
                                <div
                                    className="flex items-start h-full overflow-x-auto overflow-y-hidden gap-4 p-4 lg:p-6 scrollbar-thin scrollbar-thumb-gray-200"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {lists.map((list, listIndex) => (
                                        <Draggable
                                            draggableId={list.id}
                                            index={listIndex}
                                            key={list.id}
                                            isDragDisabled={currentUserRole !== 'Ketua tim'}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`w-72 sm:w-80 flex-shrink-0 flex flex-col max-h-full ${listColors[listIndex % listColors.length]} rounded-xl shadow-sm border border-transparent`}
                                                >
                                                    {/* List Header */}
                                                    <div
                                                        className="w-full flex justify-between items-start p-3 px-4 gap-2 cursor-grab active:cursor-grabbing"
                                                        {...provided.dragHandleProps}
                                                    >
                                                        {editingListId === list.id ? (
                                                            <input
                                                                autoFocus
                                                                defaultValue={list.title}
                                                                onBlur={(e) => handleUpdateListTitle(list.id, e.target.value.trim() || list.title)}
                                                                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                                                                className="bg-white border border-blue-300 rounded-md px-2 py-1 text-sm font-semibold w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                            />
                                                        ) : (
                                                            <h3
                                                                onClick={() => setEditingListId(list.id)}
                                                                className="font-bold text-gray-800 text-sm sm:text-base leading-tight cursor-text py-1 truncate"
                                                            >
                                                                {list.title}
                                                            </h3>
                                                        )}

                                                        {currentUserRole === 'Ketua tim' && (
                                                            <button
                                                                onClick={() => handleDeleteList(list.id)}
                                                                className="p-1 rounded hover:bg-black/5 text-gray-500 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash size={15} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Cards Container */}
                                                    <Droppable droppableId={list.id} type="card">
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                className={`flex flex-col gap-3 overflow-y-auto px-2 pb-2 flex-1 min-h-[50px] transition-colors scrollbar-hide ${snapshot.isDraggingOver ? "bg-black/5 rounded-lg" : ""}`}
                                                            >
                                                                {list.cards.map((card, cardIndex) => {
                                                                    const isMember = card.anggota.some(ang => ang.user && ang.user.id === user.id);

                                                                    return (
                                                                        <Draggable draggableId={card.id} index={cardIndex} key={card.id}>
                                                                            {(provided, snapshot) => (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    {...provided.dragHandleProps}
                                                                                    style={{ ...provided.draggableProps.style }}
                                                                                >
                                                                                    <div
                                                                                        className={`bg-white p-3 rounded-lg border-l-4 group relative flex flex-col space-y-2 cursor-pointer transition-all ${snapshot.isDragging ? "shadow-2xl border-blue-600 ring-2 ring-blue-200 rotate-2 z-50" : "shadow-sm border-blue-500 hover:shadow-md hover:border-blue-600"} ${!isMember && 'opacity-90 grayscale-[0.1]'}`}
                                                                                        onClick={() => handleCardClick(card)}
                                                                                    >
                                                                                        {/* Card Menu Button */}
                                                                                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setActiveMenuCardId(card.id === activeMenuCardId ? null : card.id);
                                                                                                }}
                                                                                                className="p-1 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800"
                                                                                            >
                                                                                                <Ellipsis size={16} />
                                                                                            </button>

                                                                                            {activeMenuCardId === card.id && (
                                                                                                <div ref={menuRef} className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden">
                                                                                                    <ul className="text-xs font-medium text-gray-700">
                                                                                                        <li onClick={(e) => { e.stopPropagation(); handleArchiveCard(card.id); }} className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors">
                                                                                                            <Archive size={14} className="text-gray-500" /> Arsipkan
                                                                                                        </li>
                                                                                                        <li onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }} className="px-3 py-2.5 hover:bg-red-50 hover:text-red-600 cursor-pointer flex items-center gap-2 transition-colors border-t border-gray-50">
                                                                                                            <Trash size={14} /> Hapus
                                                                                                        </li>
                                                                                                    </ul>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        
                                                                                        {/* Card Image */}
                                                                                        {card.image && (
                                                                                            <div className="w-full h-32 overflow-hidden rounded-md bg-gray-100 mb-1">
                                                                                                <img
                                                                                                    src={`/storage/${card.image}`}
                                                                                                    alt="cover"
                                                                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                                                                />
                                                                                            </div>
                                                                                        )}
                                                                                        
                                                                                        {/* Card Title */}
                                                                                        <div className="pr-6">
                                                                                            <h4 className="text-sm font-medium text-gray-800 break-words leading-snug">
                                                                                                {card.title}
                                                                                            </h4>
                                                                                        </div>

                                                                                        {/* Card Footer (Labels, Dates, Members) */}
                                                                                        <div className="flex flex-col gap-2 pt-1">
                                                                                            {card.label.length > 0 && (
                                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                                    {card.label.map((label) => (
                                                                                                        <span
                                                                                                            key={`${card.id}-${label.id}`}
                                                                                                            // PERUBAHAN DISINI: Background Solid, Text Putih
                                                                                                            className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-sm"
                                                                                                            style={{ backgroundColor: label.warna, color: '#ffffff' }}
                                                                                                        >
                                                                                                            {label.title}
                                                                                                        </span>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}

                                                                                            <div className="flex items-center justify-between mt-1 min-h-[20px]">
                                                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                                                    {card.kalender.map((kal) => {
                                                                                                        const dueDate = new Date(kal.due_date);
                                                                                                        return (
                                                                                                            <div key={kal.id} className="flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                                                                                <Clock size={12} />
                                                                                                                <span>
                                                                                                                    {dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                        );
                                                                                                    })}
                                                                                                    
                                                                                                    {card.jumlah_checklist > 0 && (
                                                                                                        <div className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border ${card.checklist_selesai === card.jumlah_checklist ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                                                                            <SquareCheckBig size={12} />
                                                                                                            <span>{card.checklist_selesai}/{card.jumlah_checklist}</span>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>

                                                                                                <div className="flex -space-x-1.5 overflow-hidden pl-1 py-0.5">
                                                                                                    {card.anggota.map((ang) => (
                                                                                                        <div
                                                                                                            key={ang.id}
                                                                                                            ref={(el) => {
                                                                                                                const key = `${card.id}-${ang.id}`;
                                                                                                                if (el) memberRef.current[key] = el;
                                                                                                                else delete memberRef.current[key];
                                                                                                            }}
                                                                                                            onMouseEnter={() => {
                                                                                                                const key = `${card.id}-${ang.id}`;
                                                                                                                const targetRef = memberRef.current[key];
                                                                                                                if (targetRef) {
                                                                                                                    hoveredAnggotaRef.current = targetRef;
                                                                                                                    setHoverdAnggota(ang);
                                                                                                                }
                                                                                                            }}
                                                                                                            onMouseLeave={() => {
                                                                                                                setHoverdAnggota(null);
                                                                                                                hoveredAnggotaRef.current = null;
                                                                                                            }}
                                                                                                            className="relative z-0 hover:z-10 transition-all transform hover:scale-110"
                                                                                                        >
                                                                                                            <div className="w-6 h-6 rounded-full ring-2 ring-white overflow-hidden bg-gray-100 shadow-sm">
                                                                                                                {ang.user && ang.user.image ? (
                                                                                                                    <img
                                                                                                                        src={`/storage/${ang.user.image}`}
                                                                                                                        alt={ang.user.name}
                                                                                                                        className="w-full h-full object-cover"
                                                                                                                    />
                                                                                                                ) : (
                                                                                                                    <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
                                                                                                                        {ang.user?.name?.charAt(0) || "?"}
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    );
                                                                })}
                                                                {provided.placeholder}
                                                                {list.cards.length === 0 && <div className="h-4"></div>}
                                                            </div>
                                                        )}
                                                    </Droppable>

                                                    {/* Add Card Button */}
                                                    {(() => {
                                                        const isProtectedList = list.title === 'Perlu Verifikasi' || list.title === 'Selesai';
                                                        const shouldShowButton = currentUserRole === 'Ketua tim' || !isProtectedList;

                                                        return shouldShowButton && (
                                                            <div className="px-3 pb-3 pt-1">
                                                                <button
                                                                    onClick={() => handleAddCard(list.id)}
                                                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-black/5 hover:text-gray-900 transition-colors"
                                                                >
                                                                    <Plus size={16} />
                                                                    <span>Tambah Kartu</span>
                                                                </button>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    {/* Add List Button */}
                                    <div className="w-72 sm:w-80 flex-shrink-0">
                                        <button
                                            onClick={() => setTambahList(true)}
                                            className="w-full flex items-center gap-2 px-4 py-3 bg-white/40 hover:bg-white rounded-xl border border-dashed border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 font-medium transition-all shadow-sm hover:shadow-md"
                                        >
                                            <Plus size={18} />
                                            <span>Tambah List Baru</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    {/* Archive Button */}
                    <Link
                        href={route('proyek.arsip', { id: dashboardId, id_tim: id_tim })}
                        className="absolute bottom-6 right-6 z-30 bg-gray-800 hover:bg-gray-900 text-white p-3.5 rounded-full shadow-xl transition-transform hover:scale-110 group"
                        title="Lihat Arsip"
                    >
                        <Archive size={22} className="group-hover:animate-pulse" />
                    </Link>

                    {hoveredAnggota && hoveredAnggotaRef.current && (
                        <TooltipAnggotaCard targetRef={hoveredAnggotaRef}>
                            {hoveredAnggota.user.name === user.name ? "Anda" : hoveredAnggota.user.name}
                        </TooltipAnggotaCard>
                    )}
                </div>
                {children}
            </Proyek>

            {notification.show && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ show: false, message: "", type: "" })}
                />
            )}

            {tambahList && (
                <TambahList
                    id={user.id}
                    close={() => setTambahList(false)}
                    id_board={id_board}
                />
            )}
            {tambahCard && (
                <TambahCard
                    id_list={tambahCard}
                    id={user.id}
                    id_tim={id_tim}
                    id_board={id_board}
                    close={() => setTambahCard("")}
                />
            )}
        </>
    );
}