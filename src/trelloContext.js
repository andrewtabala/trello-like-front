import React, { useState, createContext } from "react";
import Swal from 'sweetalert2'
import axios from 'axios'

export const TrelloContext = createContext();

export const TrelloContextProvider = (props) => {

    const timeparts = [
        {name: 'year', div: 31536000000, mod: 10000},
        {name: 'day', div: 86400000, mod: 365},
        {name: 'hour', div: 3600000, mod: 24},
        {name: 'minute', div: 60000, mod: 60},
        {name: 'second', div: 1000, mod: 60}
    ];

    const timeAgoNaive = (comparisonDate) => {
        var
           i = 0,
           l = timeparts.length,
           calc,
           values = [],
           interval = new Date().getTime() - comparisonDate.getTime();
        while (i < l) {
           calc = Math.floor(interval / timeparts[i].div) % timeparts[i].mod;
           if (calc) {
              values.push(calc + ' ' + timeparts[i].name + (calc != 1 ? 's' : ''));
           }
           i += 1;
        }
        if (values.length === 0) { values.push('0 seconds'); }
        return values.join(', ') + ' ago';
    }

    const onCreateList = () => {
        Swal.fire({
          title: 'Create new list',
          input: 'text',
          inputAttributes: {
            autocapitalize: 'off'
          },
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "Name your list",
          showCancelButton: true,
          confirmButtonText: 'Create',
          cancelButtonText: "Cancel",
          showLoaderOnConfirm: true,
        }).then((result) => {
          if (result.value) {
              const newLists = [...lists]
              newLists.push({
                name: result.value,
                tasks: []
              })
              const fetchData = async () => {
                  await axios.post("http://localhost:4000/api/v1/list/add-list", {
                    newList: { name: result.value, tasks: [] }
                  })
              }
              fetchData()
              setLists(newLists)
          }
        })
      }
    
    const onCreateTask = (i) => {
    Swal.fire({
        title: 'Create new task',
        input: 'text',
        inputAttributes: {
        autocapitalize: 'off'
        },
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "Name your task",
        showCancelButton: true,
        confirmButtonText: 'Create',
        cancelButtonText: "Cancel",
        showLoaderOnConfirm: true,
    }).then((result) => {
        if (result.value) {
            const newLists = [...lists]
            newLists[i].tasks.push({
                name: result.value,
                lastEdited: new Date().toISOString()
            })
            const fetchData = async () => {
                await axios.post("http://localhost:4000/api/v1/list/update-list", {
                  listIndex: i,
                  newContent: newLists[i]
                })
            }
            fetchData()
            setLists(newLists)
        }
    })
    }

    const onDeleteTask = (i, j) => {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
        const newLists = [...lists]
        newLists[i].tasks.splice(j, 1)
        const fetchData = async () => {
            await axios.post("http://localhost:4000/api/v1/list/update-list", {
              listIndex: i,
              newContent: newLists[i]
            })
        }
        fetchData()
        setLists(newLists)
        }
    })
    }

    const onDeleteList = (i) => {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
        const newLists = [...lists]
        newLists.splice(i, 1)
        const fetchData = async () => {
            await axios.post("http://localhost:4000/api/v1/list/delete-list", {
              listIndex: i
            })
        }
        fetchData()
        setLists(newLists)
        }
    })
    }

    const onDragEnd = (result) => {
    const newLists = [...lists]
    const fromI = result.draggableId.split("-")[0]
    const fromJ = result.draggableId.split("-")[1]
    const toI = parseInt(result.destination.droppableId)
    const toJ = result.destination.index
    newLists[toI].tasks.splice(toJ, 0, newLists[fromI].tasks[fromJ])
    newLists[fromI].tasks.splice(fromJ, 1)
    const fetchData = async () => {
        await axios.post("http://localhost:4000/api/v1/list/update-list", {
          listIndex: toI,
          newContent: newLists[toI]
        })
        await axios.post("http://localhost:4000/api/v1/list/update-list", {
          listIndex: fromI,
          newContent: newLists[fromI]
        })
    }
    fetchData()
    setLists(newLists)
    }

    const [lists, setLists] = useState([])


    return (
        <TrelloContext.Provider
            value={{
                lists,
                setLists,
                timeAgoNaive,
                onCreateList,
                onCreateTask,
                onDeleteTask,
                onDeleteList,
                onDragEnd
            }}
        >
            {props.children}
        </TrelloContext.Provider>
    );

}