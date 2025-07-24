import { Head } from "@inertiajs/react";
import Dashboard from "./Dashboard";
import { Ellipsis, Plus } from "lucide-react";
import { useState } from "react";

export default function Proyek () {

    // iss content list
    const [lists, setLists] = useState([
        {
            id: 1,
            title: "To do list",
            cards: [
                { id: 1, title: "Tugas Kuliah" },
                { id: 2, title: "Meeting dengan tim" },
            ],
        },
        {
            id: 2,
            title: "In Progress",
            cards: [{ id: 1, title: "Proyek magang" }],
        },
        {
            id: 3,
            title: "Selesai",
            cards: [],
        }
    ]);

    // drag state
    const [draggedCard, setDraggedCard] = useState(null);
    const [draggedOverList, setDraggedOverList] = useState(null);

    // handle drag start untuk card
    const handleDragCardStart = (e, card, sourceListid) => {
        setDraggedCard({card, sourceListid});
        e.dataTransfer.effectAllowed = 'move';
    }

    // handle drag over untuk list
    const handleListDragOver = (e, listId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDraggedOverList(listId);
    }

    // handle drag leave untuk list
    const handleListDragLeave = () => {
        setDraggedOverList(null);
    }

    // handle drop untuk list 
    const handleListDrop = (e, targetListid) => {
        e.preventDefault();

        if (!draggedCard || draggedCard.sourceListid === targetListid) {
            setDraggedCard(null);
            setDraggedOverList(null);
            return;
        }

        // setList
        setLists((prevList) => {
            const newList = prevList.map((list) => {
                // remove card dari source list
                if (list.id === draggedCard.sourceListid) {
                    return {
                        ...list,
                        cards: list.cards.filter(
                            (card) => card.id !== draggedCard.card.id
                        ),
                    };
                }

                // add card ke target list
                if (list.id === targetListid) {
                    return {
                        ...list,
                        cards: [...list.cards, draggedCard.card],
                    };
                }
                return list;
            });
            return newList;
        });
        setDraggedCard(null);
        setDraggedOverList(null);
    }

    // handle tambah card baru
    const handleAddCard = (listId) => {
        const cardTitle = prompt("masukan judul card");
        if(cardTitle && cardTitle.trim()){
            const newCard = {
                id: Date.now(),
                title: cardTitle.trim()
            };

            setLists((prevLists) => prevLists.map((list) => list.id === listId
                ? { ...list, cards: [...list.cards, newCard] }
                : list
            ));
        }
    };

    // handle tambah list baru
    const handleAddList = () => {
         const listTitle = prompt("Masukkan judul list:");
         if (listTitle && listTitle.trim()) {
             const newList = {
                 id: Date.now(),
                 title: listTitle.trim(),
                 cards: [],
             };
             setLists((prev) => [...prev, newList]);
         }
    }

    return (
        <>
            <Dashboard>
                <Head title="Proyek" />
                <div className="h-full w-full bg-slate-300 rounded-lg">
                    {/* board */}
                    <div className="flex items-start gap-2">
                        {lists.map((list) => (
                            <div
                                key={list.id}
                                className="w-[280px] bg-white/40 px-4 m-2 rounded-lg"
                                onDragOver={(e) =>
                                    handleListDragOver(e, list.id)
                                }
                                onDragLeave={handleListDragLeave}
                                onDrop={(e) => handleListDrop(e, list.id)}
                            >
                                {/* judul */}
                                <div className="w-full flex justify-between items-center my-2">
                                    <h1>{list.title}</h1>
                                    <div className="py-[1px] px-[2px] rounded-md hover:bg-gray-300 cursor-pointer">
                                        <Ellipsis />
                                    </div>
                                </div>

                                {/* body content*/}
                                <div className="w-full flex flex-col gap-2">
                                    {/* judul list */}
                                    {list.cards.map((card) => (
                                        <div
                                            key={card.id}
                                            className="bg-white p-2 rounded-md cursor-move hover:shadow-md transition-shadow duration-200 border-l-4 border-blue-500"
                                            draggable
                                            onDragStart={(e) =>
                                                handleDragCardStart(
                                                    e,
                                                    card,
                                                    list.id
                                                )
                                            }
                                        >
                                            <h1>{card.title}</h1>
                                        </div>
                                    ))}
                                </div>

                                {/* bottom content */}
                                <div
                                    onClick={() => handleAddCard(list.id)}
                                    className="flex my-3 gap-2 cursor-pointer"
                                >
                                    <Plus />
                                    <p>Tambah</p>
                                </div>
                            </div>
                        ))}

                        {/* Tambah card/list */}
                        <div className="w-[280px] bg-white/40 px-4 m-2 rounded-lg">
                            {/* bottom content */}
                            <div
                                className="flex my-3 gap-2 cursor-pointer"
                                onClick={handleAddList}
                            >
                                <Plus />
                                <p>Tambah</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Dashboard>
        </>
    );
}