import logo from './logo.svg';
import { useContext, useEffect } from 'react'
import { TrelloContext, TrelloContextProvider } from './trelloContext'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Swal from 'sweetalert2'
import axios from 'axios'

function App() {

  const {
    lists,
    setLists,
    timeAgoNaive,
    onCreateList,
    onCreateTask,
    onDeleteTask,
    onDeleteList,
    onDragEnd
  } = useContext(TrelloContext)

  useEffect(() => {
    const getLists = async () => {
      const lists = await axios.get("http://localhost:4000/api/v1/list/get-lists")
      console.log(lists.data.data.lists);
      setLists(lists.data.data.lists)
    }
    getLists()
    // setLists(newLists)
  }, [])

  return (
      <div className="w-full h-screen py-12 px-24">
          <div className="flex justify-center mt-12">
              <span className="text-2xl">List of tasks</span>
          </div>
          <div onClick={() => onCreateList()} className="w-36 h-12 mt-16 bg-green-300 cursor-pointer rounded-md flex justify-center items-center">
            Create new list
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto mt-4">
              {lists.map((item, i) => {
                return (
                  <Droppable droppableId={`${i}`}>
                    {(provided) => (
                      <div className="mr-4" {...provided.droppableProps} ref={provided.innerRef}>
                        <div className="flex justify-between">
                          <div className="ml-2">
                            <span className="text-lg">{item.name}</span>
                          </div>
                          {item.tasks.length === 0 && (
                            <div onClick={() => onDeleteList(i)} className="w-5 h-5 mr-2 flex justify-center rounded-md cursor-pointer text-xs items-center bg-red-200">
                              ✕
                            </div>
                          )}
                        </div>
                        <div className="w-96 py-2 bg-gray-200 rounded-md">
                          {item.tasks.map((item, j) => {
                            return (
                              <Draggable draggableId={`${i}-${j}`} index={j} id={`${i}-${j}`}>
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="my-4 mx-3 px-2 py-1 bg-gray-300 rounded-md">
                                    <div className="flex justify-between">
                                      <p className="text-xs mb-2">{`Last edited ${timeAgoNaive(new Date(item.lastEdited))}`}</p>
                                      <div onClick={() => onDeleteTask(i, j)} className="w-5 h-5 flex justify-center rounded-md cursor-pointer text-xs items-center bg-red-200">
                                        ✕
                                      </div>
                                    </div>
                                    <p>{item.name}</p>
                                  </div>
                                )}
                              </Draggable>
                            )
                          })}
                          <div onClick={() => onCreateTask(i)} className="w-24 h-8 cursor-pointer ml-3 tet-sm flex justify-center items-center rounded-md bg-green-300">
                            Add task
                          </div>
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )
              })}
            </div>
          </DragDropContext>
      </div>
  );
}

export default App;
