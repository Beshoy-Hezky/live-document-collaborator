import {useEffect, useState} from 'react'
import "quill/dist/quill.snow.css"
import Quill from "quill"
import {io} from 'socket.io-client'
import { useParams } from 'react-router-dom'

export default function TextEditor() {
  const SAVE_INTERVAL_MS = 500 // 0.5 seconds
  const params = useParams()
  const documentId = params.id
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()
  useEffect(() => {
    const s = io("http://localhost:3001")
    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])
    useEffect(() =>{
        const q = new Quill(".container", { theme: "snow"})
        q.disable()
        q.setText("Loading...")
        setQuill(q)
    }, [])

    useEffect(() => {
      if (socket == null || quill == null) return
      const changefunc = (delta)=> {
        quill.updateContents(delta)
      }
      socket.on('receive-changes', changefunc)

      return () => {
        socket.off('receive-changes', changefunc)
      }
    })

    useEffect(() => {
      if (socket == null || quill == null) return
      const changefunc = function(delta,oldDelta,source){
        if (source !== 'user') return // I did this to make sure this isnt from an api or anything
        socket.emit("send-changes", delta)
      }
      // this is a function provided by quill
      quill.on('text-change', changefunc)

      //remove event listener if we no longer need it
      return () => {
        quill.off('text-change', changefunc)
      }
    })

    useEffect(() => {
      if (socket == null || quill == null) return
      const interval = setInterval(() => {
        socket.emit("save-document", quill.getContents())
      }, SAVE_INTERVAL_MS)

      return () => {
        clearInterval(interval)
      }
      }, [socket, quill])

    useEffect(() => {
      if (socket == null || quill == null) return
      // setting up an event listener to that will be removed after it listens once
      socket.once("load-document", (document) => {
        quill.setContents(document)
        quill.enable()
      })
      
      // think of this as a GET request
      socket.emit('get-document', documentId)

    }, [socket,quill,documentId])

    useEffect(() => {

    }, [socket])
  return (
    <div className = "container"></div>
  )
}
