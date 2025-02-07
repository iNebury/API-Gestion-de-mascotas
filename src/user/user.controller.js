import { hash } from "argon2";
import User from "./user.model.js"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export const getUserById = async (req, res) => {
    try{
        const { uid } = req.params;
        const user = await User.findById(uid)

        if(!user){
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            })
        }

        return res.status(200).json({
            success: true,
            user
        })

    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al obtener el usuario",
            error: err.message
        })
    }
}

export const getUsers = async (req, res) => {
    try{
        const { limite = 5, desde = 0 } = req.query
        const query = { status: true }

        const [total, users ] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        return res.status(200).json({
            success: true,
            total,
            users
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al obtener los usuarios",
            error: err.message
        })
    }
}

export const deleteUser = async (req, res) => {
    try{
        const { uid } = req.params
        
        const user = await User.findByIdAndUpdate(uid, {status: false}, {new: true})

        return res.status(200).json({
            success: true,
            message: "Usuario eliminado",
            user
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al eliminar el usuario",
            error: err.message
        })
    }
}

export const updatePassword = async (req, res) => {
    try{
        const { uid } = req.params
        const { newPassword } = req.body

        const user = await User.findById(uid)

        const matchOldAndNewPassword = await verify(user.password, newPassword)

        if(matchOldAndNewPassword){
            return res.status(400).json({
                success: false,
                message: "La nueva contraseña no puede ser igual a la anterior"
            })
        }

        const encryptedPassword = await hash(newPassword)

        await User.findByIdAndUpdate(uid, {password: encryptedPassword}, {new: true})

        return res.status(200).json({
            success: true,
            message: "Contraseña actualizada",
        })

    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al actualizar contraseña",
            error: err.message
        })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const  data  = req.body;

        const user = await User.findByIdAndUpdate(uid, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Usuario Actualizado',
            user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar usuario',
            error: err.message
        });
    }
}


export const updateUserProfilePicture = async (req, res) => {
    try {
        const { uid } = req.params;  // Obtener el ID del usuario de los parámetros de la URL
        let newProfilePicture = req.file ? req.file.filename : null;  // Si hay archivo adjunto, obtener el nombre del archivo

        // Buscar al usuario actual
        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'El usuario no ha sido encontrado',
            });
        }


        if (user.profilePicture) {
            // Aquí especificamos la ruta correcta del archivo en el directorio 'public/uploads/profile-pictures'
            const oldImagePath = path.join(__dirname, '../../public/uploads/profile-pictures', user.profilePicture);
            
        }

        // Actualizamos el documento de usuario con la nueva imagen de perfil
        user.profilePicture = newProfilePicture;
        await user.save();

        // Devolvemos respuesta exitosa
        res.status(200).json({
            success: true,
            msg: 'Imagen de perfil actualizada',
            user,  // Incluimos el usuario actualizado en la respuesta
        });
    } catch (err) {
        // Manejo de errores en caso de fallos
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar imagen de perfil',
            error: err.message,  // Enviamos el mensaje de error para depuración
        });
    }
};



