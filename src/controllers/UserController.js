
import User from "../models/User.js";

async function getUsers(request, response) {

    const users = await User.find()

    return response.status(200).json(users);
}

async function createUser(request, response){

    const user = request.body

    const newUser = await User.create(user)

    return response.status(201).json(newUser);
}

async function updateUser(request, response){

    const id = request.params.id

    let { name, email, password, location } = request.body

    const user = await User.findById({ _id: id })

    if(user){
        user.name = name;
        user.email = email;
        user.password = password;
        user.location = location;
        await user.save();

        response.json({ user })
    } else {
        response.json({ error: 'Usuario não encontrado'})
    }

   
}

async function deleteUser(request, response){
    const id = request.params.id

    await User.findByIdAndDelete({ _id: id })

    return response.status(200).json({ response: "Usuario Deletado" })

}

export { getUsers, createUser, updateUser, deleteUser }