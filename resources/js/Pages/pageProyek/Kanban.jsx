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

            if (sourceList.title === 'Verifikasi Katim') {
                alert('Anda tidak diizinkan memindahkan tugas dari list verifikasi.');
                return;
            }

            if (sourceList.title === 'Anngeus') {
                alert('Anda tidak dapat memindahkan tugas yang sudah selesai.');
                return;
            }

            if (destList.title === 'Anngeus') {
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
                <div className="h-full w-full bg-slate-300 rounded-lg overflow-x-auto relative">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable
                            droppableId="all-lists"
                            direction="horizontal"
                            type="list"
                        >
                            {(provided) => (
                                <div
                                    className="flex items-start gap-2 px-4 py-4"
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
                                                    className="w-[280px] flex-shrink-0 bg-white/40 px-4 pb-4 rounded-lg"
                                                >
                                                    <div
                                                        className="w-full flex justify-between items-center my-3"
                                                        {...provided.dragHandleProps}
                                                    >
                                                        {editingListId ===
                                                            list.id ? (
                                                            <input
                                                                autoFocus
                                                                defaultValue={
                                                                    list.title
                                                                }
                                                                onBlur={(e) =>
                                                                    handleUpdateListTitle(
                                                                        list.id,
                                                                        e.target.value.trim() ||
                                                                        list.title
                                                                    )
                                                                }
                                                                onKeyDown={(
                                                                    e
                                                                ) => {
                                                                    if (
                                                                        e.key ===
                                                                        "Enter"
                                                                    )
                                                                        e.target.blur();
                                                                }}
                                                                className="bg-white border rounded px-2 py-1 text-sm w-full"
                                                            />
                                                        ) : (
                                                            <h1
                                                                onClick={() =>
                                                                    setEditingListId(
                                                                        list.id
                                                                    )
                                                                }
                                                                className="font-bold text-lg cursor-pointer"
                                                            >
                                                                {list.title}
                                                            </h1>
                                                        )}

                                                        {currentUserRole === 'Ketua tim' && (
                                                            <div
                                                                onClick={() => handleDeleteList(list.id)}
                                                                className="p-1 rounded-md hover:bg-gray-300 cursor-pointer"
                                                            >
                                                                <Trash size={16} className="text-gray-600 hover:text-red-500 transition-colors" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Droppable
                                                        droppableId={list.id}
                                                        type="card"
                                                    >
                                                        {(provided, snapshot) => (
                                                            <>
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.droppableProps}
                                                                    className={`flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 transition-colors my-scrollable-element relative z-0 ${snapshot.isDraggingOver ? "bg-blue-100/40" : ""}`}
                                                                    style={{ minHeight: "40px" }}
                                                                >
                                                                    {list.cards.map(
                                                                        (card, cardIndex) => {
                                                                            const isMember = card.anggota.some(ang => ang.user && ang.user.id === user.id);

                                                                            return (
                                                                                <Draggable draggableId={card.id} index={cardIndex} key={card.id}>
                                                                                    {(provided, snapshot) => (
                                                                                        <div>
                                                                                            <div
                                                                                                className={`bg-white p-2 group/elipsis rounded-md hover:shadow-md transition-shadow border-l-4 relative flex flex-col items-start space-x-1 cursor-pointer ${snapshot.isDragging ? "shadow-lg border-blue-600" : "border-blue-500"
                                                                                                    } ${!isMember && 'opacity-90'
                                                                                                    }`}
                                                                                                ref={provided.innerRef}
                                                                                                {...provided.draggableProps}
                                                                                                {...provided.dragHandleProps}
                                                                                                onClick={() => handleCardClick(card)}
                                                                                            >
                                                                                                <div className="absolute top-1 right-1 z-10">
                                                                                                    <button
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            setActiveMenuCardId(card.id === activeMenuCardId ? null : card.id);
                                                                                                        }}
                                                                                                        className="p-1 rounded hover:bg-gray-200"
                                                                                                    >
                                                                                                        <Ellipsis size={18} />
                                                                                                    </button>

                                                                                                    {activeMenuCardId === card.id && (
                                                                                                        <div ref={menuRef} className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-20">
                                                                                                            <ul className="py-1 text-sm">
                                                                                                                <li onClick={(e) => { e.stopPropagation(); handleArchiveCard(card.id); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                                                                                                                    <Archive size={14} /> Arsipkan
                                                                                                                </li>
                                                                                                                <li onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600 flex items-center gap-2">
                                                                                                                    <Trash size={14} /> Hapus
                                                                                                                </li>
                                                                                                            </ul>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                                
                                                                                                {card.image ? (
                                                                                                    <img
                                                                                                        src={`/storage/${card.image || ""}`}
                                                                                                        alt="image"
                                                                                                        className="w-full object-cover mb-5 mt-5"
                                                                                                    />
                                                                                                ) : ("")}
                                                                                                <div>
                                                                                                    <h1 className="text-md break-words">
                                                                                                        {card.title}
                                                                                                    </h1>
                                                                                                </div>
                                                                                                <div className="w-full">
                                                                                                    <div className="flex w-full justify-between items-center gap-4 pr-4 relative mt-2">
                                                                                                        <div className={`w-full flex flex-col ${card.label.length > 0 ? 'gap-2' : 'gap-0'}`}>
                                                                                                            <div className="flex items-center gap-1.5">
                                                                                                                {card.label.map((label) => (
                                                                                                                    <div
                                                                                                                        key={`${card.id}-${label.id}`}
                                                                                                                        className="rounded-md px-2 py-0.5 text-xs font-semibold text-black"
                                                                                                                        style={{ backgroundColor: label.warna }}
                                                                                                                    >
                                                                                                                        {label.title}
                                                                                                                    </div>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                            <div className="flex items-center gap-4 ">
                                                                                                                <div>
                                                                                                                    {card.kalender.map((kal) => {
                                                                                                                        const dueDate = new Date(kal.due_date);
                                                                                                                        const tgl = dueDate.getDate();
                                                                                                                        const bulan = dueDate.toLocaleString('id-ID', { month: 'long' }).slice(0, 4);
                                                                                                                        return (
                                                                                                                            <div key={kal.id} className="text-xs flex items-center gap-1 pt-1 text-gray-600">
                                                                                                                                <Clock size={16} />
                                                                                                                                <p>{bulan}{" "}{tgl}</p>
                                                                                                                            </div>
                                                                                                                        );
                                                                                                                    })}
                                                                                                                </div>
                                                                                                                {card.jumlah_checklist > 0 && (
                                                                                                                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                                                                                                                        <SquareCheckBig size={15} />
                                                                                                                        <div>{card.checklist_selesai}/{card.jumlah_checklist}</div>
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="flex relative">
                                                                                                            {card.anggota.map((ang) => (
                                                                                                                <div
                                                                                                                    ref={(el) => {
                                                                                                                        const key = `${card.id}-${ang.id}`;
                                                                                                                        if (el) { memberRef.current[key] = el; }
                                                                                                                        else { delete memberRef.current[key]; }
                                                                                                                    }}
                                                                                                                    key={ang.id}
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
                                                                                                                    className="relative cursor-pointer"
                                                                                                                >
                                                                                                                    <div className="w-5 h-5 items-center">
                                                                                                                        {ang.user ? (
                                                                                                                            ang.user.image ? (
                                                                                                                                <img
                                                                                                                                    src={`/storage/${ang.user.image}`}
                                                                                                                                    alt="image_user"
                                                                                                                                    className="object-cover h-full w-full rounded-full"
                                                                                                                                />
                                                                                                                            ) : (
                                                                                                                                <div className="flex justify-center items-center w-full h-full rounded-full bg-blue-600 text-white">
                                                                                                                                    <p className="text-[10px]">{ang.user.name.charAt(0)}</p>
                                                                                                                                </div>
                                                                                                                            )
                                                                                                                        ) : ("")}
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
                                                                        }
                                                                    )}
                                                                    {provided.placeholder}
                                                                    {list.cards.length === 0 && (
                                                                        <div className="px-2 py-1"></div>
                                                                    )}
                                                                </div>
                                                                {hoveredAnggota && hoveredAnggotaRef.current && (
                                                                    <TooltipAnggotaCard targetRef={hoveredAnggotaRef}>
                                                                        {hoveredAnggota.user.name === user.name ? "Anda" : hoveredAnggota.user.name}
                                                                    </TooltipAnggotaCard>
                                                                )}
                                                            </>
                                                        )}
                                                    </Droppable>

                                                    {(() => {
                                                        const isProtectedList = list.title === 'Verifikasi Katim' || list.title === 'Selesai';
                                                        const shouldShowButton = currentUserRole === 'Ketua tim' || !isProtectedList;

                                                        return shouldShowButton && (
                                                            <div
                                                                onClick={() => handleAddCard(list.id)}
                                                                className="flex mt-4 gap-2 items-center text-sm text-gray-700 cursor-pointer hover:opacity-80"
                                                            >
                                                                <Plus size={16} />
                                                                <p>Tambah</p>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    <div
                                        onClick={() => setTambahList(true)}
                                        className="w-[280px] flex-shrink-0 bg-white/40 px-4 py-4 rounded-lg cursor-pointer hover:bg-white/60"
                                    >
                                        <div className="flex gap-2 items-center text-sm text-gray-700">
                                            <Plus size={16} />
                                            <p>Tambah List</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <Link
                        href={route('proyek.arsip', { id: dashboardId, id_tim: id_tim })}
                        className="absolute bottom-5 right-5 bg-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
                        title="Lihat Arsip"
                    >
                        <Archive size={24} />
                    </Link>
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