import { Head } from "@inertiajs/react";
import Dashboard from "./Dashboard";
import { Archive, Ellipsis, Pencil, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function Proyek() {
    const [lists, setLists] = useState([
        {
            id: "1",
            title: "To do list",
            cards: [
                { id: "101", title: "Tugas Kuliah" },
                { id: "102", title: "Meeting dengan tim" },
            ],
        },
        {
            id: "2",
            title: "In Progress",
            cards: [{ id: "103", title: "Proyek magang" }],
        },
        {
            id: "3",
            title: "Selesai",
            cards: [],
        },
    ]);

    const [editingListId, setEditingListId] = useState(null);
    const [openElipsis, setOpenElipsis] = useState(null);
    const elipsisRef = useRef({});

    const handleDragEnd = (result) => {
        const { source, destination, type } = result;
        if (!destination) return;

        if (type === "list") {
            const reorderedLists = Array.from(lists);
            const [removed] = reorderedLists.splice(source.index, 1);
            reorderedLists.splice(destination.index, 0, removed);
            setLists(reorderedLists);
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

            if (sourceListIndex === destListIndex) {
                sourceCards.splice(destination.index, 0, movedCard);
                const newLists = [...lists];
                newLists[sourceListIndex].cards = sourceCards;
                setLists(newLists);
            } else {
                destCards.splice(destination.index, 0, movedCard);
                const newLists = [...lists];
                newLists[sourceListIndex].cards = sourceCards;
                newLists[destListIndex].cards = destCards;
                setLists(newLists);
            }
        }
    };

    const handleAddList = () => {
        const title = prompt("Masukkan judul list:");
        if (!title?.trim()) return;
        const newList = {
            id: Date.now().toString(),
            title: title.trim(),
            cards: [],
        };
        setLists((prev) => [...prev, newList]);
    };

    const handleAddCard = (listId) => {
        const title = prompt("Masukkan judul card:");
        if (!title?.trim()) return;
        const newCard = {
            id: Date.now().toString(),
            title: title.trim(),
        };

        setLists((prev) =>
            prev.map((list) =>
                list.id === listId
                    ? { ...list, cards: [...list.cards, newCard] }
                    : list
            )
        );
    };

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

  
    

    return (
        <Dashboard>
            <Head title="Proyek" />
            <div
                className="h-full w-full bg-slate-300 rounded-lg overflow-x-auto"
            >
                <DragDropContext
                    onDragEnd={handleDragEnd}
                >
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
                                                {/* Header List */}
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
                                                            onKeyDown={(e) => {
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
                                                    {/* Elipsis */}
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
                                                            <div className="bg-white w-36 p-2 absolute -right-[150px] z-50 top-0 rounded-md shadow-lg">
                                                                <ul className="w-full">
                                                                    <li className="w-full flex gap-3 items-center hover:bg-gray-200 px-2 py-1 rounded-md cursor-pointer">
                                                                        <Archive className="w-4 h-4" />
                                                                        Arsip
                                                                    </li>
                                                                    <li className="w-full flex gap-3 items-center hover:bg-gray-200 px-2 py-1 rounded-md cursor-pointer">
                                                                        <Pencil className="w-4 h-4" />
                                                                        Edit
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Cards (with fix for empty list) */}
                                                <Droppable
                                                    droppableId={list.id}
                                                    type="card"
                                                >
                                                    {(provided, snapshot) => (
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
                                                                            provided
                                                                        ) => (
                                                                            <div
                                                                                className="bg-white p-2 rounded-md cursor-move hover:shadow-md transition-shadow border-l-4 border-blue-500"
                                                                                ref={
                                                                                    provided.innerRef
                                                                                }
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                            >
                                                                                <h1 className="text-sm break-words">
                                                                                    {
                                                                                        card.title
                                                                                    }
                                                                                </h1>
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

                                                {/* Tambah Card */}
                                                <div
                                                    onClick={() =>
                                                        handleAddCard(list.id)
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
                                    onClick={handleAddList}
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
        </Dashboard>
    );
}
