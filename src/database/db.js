
import mongoose from "mongoose";

async function connectDatabase() {
    await mongoose.connect(
    `mongodb+srv://renatoti:0EfojHJEw33gFA80@cluster0.nwg4g52.mongodb.net/`
    )
}

mongoose.Promise = global.Promise;

export default connectDatabase