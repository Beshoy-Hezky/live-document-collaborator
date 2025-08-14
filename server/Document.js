const {Schema, model} = require('mongoose')

const DocumentSchema = new Schema({
    _id: String,
    data: Object
})

// Creating a Mongoose model from the schema
// model(name, schema) tells Mongoose:
// - Name of the model: "Document"
// - Use the DocumentSchema defined above
const Document = model("Document", DocumentSchema);

// Exporting the model so it can be used in other files
module.exports = Document;
