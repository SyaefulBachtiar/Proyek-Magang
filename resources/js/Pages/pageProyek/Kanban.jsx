import { Head, router, usePage } from "@inertiajs/react";
import {
    Archive,
    Check,
    Ellipsis,
    Pencil,
    Plus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Proyek from "../Proyek";
import TambahCard from "@/modal/Proyek/TambahCard";
import TambahList from "@/modal/Proyek/TambahList";




export default function Kanban({ children, dashboardId, activePage, tim, dataBoard, id_tim }) {

    const user = usePage().props.auth.user;
    const {id_board} = usePage().props;

    const [tambahCard, setTambahCard] = useState("");
    const [tambahList, setTambahList] = useState(false);

    const [lists, setLists] = useState([]);

    useEffect(() => {
        if (dataBoard) {
            const mappedLists = dataBoard.map((list) => ({
                id: list.id.toString(),
                title: list.judul,
                cards: list.cards.map((card) => ({
                    id: card.id.toString(),
                    title: card.nama_card,
                    image: card.image
                })),
            }));
            setLists(mappedLists);
        }
    }, [dataBoard]);

    const [editingListId, setEditingListId] = useState(null);
    const [openElipsis, setOpenElipsis] = useState(null);
    const elipsisRef = useRef({});

    const handleDragEnd = async (result) => {
        const { source, destination, type } = result;
        if (!destination) return;

        if (type === "list") {
            const reorderedLists = Array.from(lists);
            const [removed] = reorderedLists.splice(source.index, 1);
            reorderedLists.splice(destination.index, 0, removed);
            setLists(reorderedLists);

            // Update urutan di database
            const updatedLists = reorderedLists.map((list, index) => ({
                id: list.id,
                urutan_posisi: index + 1,
            }));

            try {
                await router.post(
                    route("proyek.update-list-order", {id: user.id}),
                    {
                        lists: updatedLists,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        only: [],
                    }
                );
            } catch (error) {
                console.error("Error updating list order:", error);
                // Rollback jika error
                // setLists(originalLists);
            }

            console.log(
                "Urutan List Sekarang:",
                reorderedLists.map((l, index) => `${index + 1}. ${l.title}`)
            );
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
                // Pindah dalam list yang sama
                sourceCards.splice(destination.index, 0, movedCard);
                const newLists = [...lists];
                newLists[sourceListIndex].cards = sourceCards;
                setLists(newLists);

                // Update urutan cards dalam list yang sama
                updatedCards = sourceCards.map((card, index) => ({
                    id: card.id,
                    urutan: index + 1,
                    id_list: source.droppableId,
                }));
            } else {
                // Pindah ke list berbeda
                destCards.splice(destination.index, 0, movedCard);
                const newLists = [...lists];
                newLists[sourceListIndex].cards = sourceCards;
                newLists[destListIndex].cards = destCards;
                setLists(newLists);

                // Update urutan untuk kedua list
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

                console.log(
                    `Card dipindahkan ke list: ${lists[destListIndex].title}`
                );
                console.log(
                    `Urutan card sekarang di "${lists[destListIndex].title}":`,
                    destCards.map((card, idx) => `${idx + 1}. ${card.title}`)
                );
            }

            // Kirim update ke database
            try {
                await router.post(
                    route("proyek.update-card-order", { id: user.id }),
                    {
                        cards: updatedCards,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        only: [],
                    }
                );
            } catch (error) {
                console.error("Error updating card order:", error);
                // Rollback jika error
            }
        }
    };

    // const handleAddList = () => {
    //     const title = prompt("Masukkan judul list:");
    //     if (!title?.trim()) return;
    //     const newList = {
    //         id: Date.now().toString(),
    //         title: title.trim(),
    //         cards: [],
    //     };
    //     setLists((prev) => [...prev, newList]);
    // };

    const handleAddCard = (listId) => {
        setTambahCard(listId);
    };

    //    const handleAddCard = (listId) => {
    //        const title = prompt("Masukkan judul card:");
    //        if (!title?.trim()) return;
    //        const newCard = {
    //            id: Date.now().toString(),
    //            title: title.trim(),
    //        };

    //        setLists((prev) =>
    //            prev.map((list) =>
    //                list.id === listId
    //                    ? { ...list, cards: [...list.cards, newCard] }
    //                    : list
    //            )
    //        );
    //    };

    const handleUpdateListTitle = (listId, newTitle) => {
        setLists((prev) =>
            prev.map((list) =>
                list.id === listId ? { ...list, title: newTitle } : list
            )
        );
        setEditingListId(null);
    };

    const handleElipsis = (listId) => {
        setOpenElipsis((prev) => (prev === listId ? null : listId));
    };

    // handle clickouside elipsis
    useEffect(() => {
        const handleClickOutside = (e) => {
            const clickedOutsideAll = Object.values(elipsisRef.current).every(
                (ref) => ref && !ref.contains(e.target)
            );
            if (clickedOutsideAll) setOpenElipsis(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    //handle lihat card
    const handleLihatCard = (cardId) => {
        router.visit(
            route("proyek.card", {
                id: dashboardId,
                cardId: cardId,
                id_tim: tim.id,
            }) // Kunjungi rute Proyek yang sama
        );
    };

    return (
        <>
            <Proyek dashboardId={dashboardId} activePage={activePage} tim={tim}>
                <Head title="Proyek" />
                <div className="h-full w-full bg-slate-300 rounded-lg overflow-x-auto">
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
                                                        <div
                                                            ref={(el) =>
                                                                (elipsisRef.current[
                                                                    list.id
                                                                ] = el)
                                                            }
                                                            className="relative"
                                                        >
                                                            <div
                                                                onClick={() =>
                                                                    handleElipsis(
                                                                        list.id
                                                                    )
                                                                }
                                                                className="p-1 rounded-md hover:bg-gray-300 cursor-pointer"
                                                            >
                                                                <Ellipsis
                                                                    size={18}
                                                                />
                                                            </div>
                                                            {openElipsis ===
                                                                list.id && (
                                                                <div className="bg-white w-72 p-2 absolute -right-[300px] z-50 top-0 rounded-md shadow-lg">
                                                                    <ul className="w-full">
                                                                        <li className="w-full flex gap-3 items-center hover:bg-gray-200 px-2 py-1 rounded-md cursor-pointer">
                                                                            Arsip
                                                                            <Archive className="w-4 h-4" />
                                                                        </li>
                                                                        <li className="w-full flex gap-3 items-center hover:bg-gray-200 px-2 py-1 rounded-md cursor-pointer">
                                                                            Edit
                                                                            <Pencil className="w-4 h-4" />
                                                                        </li>
                                                                        <li className="w-full flex gap-3 items-center hover:bg-gray-200 px-2 py-1 rounded-md cursor-pointer">
                                                                            <p>
                                                                                Tandai
                                                                                sudah
                                                                                selesai
                                                                            </p>
                                                                            <div className="p-1 bg-green-400 rounded-md">
                                                                                <Check className="w-4 h-4 text-white" />
                                                                            </div>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Cards */}
                                                    <Droppable
                                                        droppableId={list.id}
                                                        type="card"
                                                    >
                                                        {(
                                                            provided,
                                                            snapshot
                                                        ) => (
                                                            <div
                                                                ref={
                                                                    provided.innerRef
                                                                }
                                                                {...provided.droppableProps}
                                                                className={`flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 transition-colors my-scrollable-element ${
                                                                    snapshot.isDraggingOver
                                                                        ? "bg-blue-100/40"
                                                                        : ""
                                                                }`}
                                                                style={{
                                                                    minHeight:
                                                                        "40px",
                                                                }}
                                                            >
                                                                {list.cards.map(
                                                                    (
                                                                        card,
                                                                        cardIndex
                                                                    ) => (
                                                                        <Draggable
                                                                            draggableId={
                                                                                card.id
                                                                            }
                                                                            index={
                                                                                cardIndex
                                                                            }
                                                                            key={
                                                                                card.id
                                                                            }
                                                                        >
                                                                            {(
                                                                                provided,
                                                                                snapshot
                                                                            ) => (
                                                                                <div>
                                                                                    <div
                                                                                        className={`bg-white p-2 group rounded-md cursor-move hover:shadow-md transition-shadow border-l-4 relative ${
                                                                                            snapshot.isDragging
                                                                                                ? "shadow-lg border-blue-600"
                                                                                                : "border-blue-500"
                                                                                        }`}
                                                                                        ref={
                                                                                            provided.innerRef
                                                                                        }
                                                                                        {...provided.draggableProps}
                                                                                        {...provided.dragHandleProps}
                                                                                    >
                                                                                        <Ellipsis
                                                                                            className="absolute top-0 right-0 m-2 hidden group-hover:flex cursor-pointer"
                                                                                            size={
                                                                                                18
                                                                                            }
                                                                                        />
                                                                                        {card.image ? (
                                                                                            <img
                                                                                                src={`/storage/${
                                                                                                    card.image ||
                                                                                                    ""
                                                                                                }`}
                                                                                                alt="image"
                                                                                                className="w-full object-cover mb-5 mt-5"
                                                                                            />
                                                                                        ) : (
                                                                                            ""
                                                                                        )}
                                                                                        <div
                                                                                            onClick={() => {
                                                                                                handleLihatCard(
                                                                                                    card.id,
                                                                                                    card.title
                                                                                                );
                                                                                            }}
                                                                                            className="cursor-pointer hover:underline"
                                                                                        >
                                                                                            <h1 className="text-sm break-words">
                                                                                                {
                                                                                                    card.title
                                                                                                }
                                                                                            </h1>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    )
                                                                )}
                                                                {
                                                                    provided.placeholder
                                                                }
                                                                {list.cards
                                                                    .length ===
                                                                    0 && (
                                                                    <div className="px-2 py-1"></div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Droppable>

                                                    {/* Add Card */}
                                                    <div
                                                        onClick={() =>
                                                            handleAddCard(
                                                                list.id
                                                            )
                                                        }
                                                        className="flex mt-4 gap-2 items-center text-sm text-gray-700 cursor-pointer hover:opacity-80"
                                                    >
                                                        <Plus size={16} />
                                                        <p>Tambah</p>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    {/* Tambah List */}
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
                </div>

                {children}
            </Proyek>
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
