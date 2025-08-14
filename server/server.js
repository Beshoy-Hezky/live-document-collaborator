// You are importing a module, and that module exports a function.
// typeof require('socket.io') === 'function'  // true
const mongoose = require('mongoose');
const Document = require("./Document")

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost/google-docs-clone');
}

const socketIO = require('socket.io');
const io = socketIO(3001, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document != null) {
    return document
  }

  return await Document.create({ _id: id, data: "" })
}

io.on("connection", socket => {
    socket.on('get-document', async (documentId) => {
        const doc = await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit("load-document", doc.data )
        socket.on("send-changes", (delta) => {
        // Sends the delta (document changes, e.g. from a rich text editor) to all other connected clients, except the one that originally sent it.
        socket.broadcast.to(documentId).emit("receive-changes", delta)
        })

        socket.on("save-document", async (data) => {
            await Document.findByIdAndUpdate(documentId, {data})
        })
    })
})

