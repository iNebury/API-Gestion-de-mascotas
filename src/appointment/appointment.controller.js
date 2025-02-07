import Pet from "../pet/pet.model.js";
import Appointment from "../appointment/appointment.model.js";
import {parse} from "date-fns";

export const saveAppointment = async (req, res) => {
  try {
    const data = req.body;

    const isoDate = new Date(data.date);

    if (isNaN(isoDate.getTime())) {
      return res.status(400).json({
        success: false,
        msg: "Fecha inválida",
      });
    }

    const pet = await Pet.findOne({ _id: data.pet });
    if (!pet) {
      return res.status(404).json({ 
        success: false, 
        msg: "No se encontró la mascota" 
      });
    }

    const existAppointment = await Appointment.findOne({
      pet: data.pet,
      user: data.user,
      date: {
        $gte: new Date(isoDate).setHours(0, 0, 0, 0),
        $lt: new Date(isoDate).setHours(23, 59, 59, 999),
      },
    });

    if (existAppointment) {
      return res.status(400).json({
        success: false,
        msg: "El usuario y la mascota ya tienen una cita para este día",
      });
    }

    const appointment = new Appointment({ ...data, date: isoDate });
    await appointment.save();

    return res.status(200).json({
      success: true,
      msg: `Cita creada exitosamente en fecha ${data.date}`,
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      msg: "Error al crear la cita", 
      error 
    });
  }
};

export const getAppointment = async (req, res) => {
  try {
      const { limite = 5, desde = 0 } = req.query;
      const query = { status: "CREATED" };

      const [total, appointment] = await Promise.all([
          Appointment.countDocuments(query),
          Appointment.find(query)
              .skip(Number(desde))
              .limit(Number(limite))
              .populate('pet')  
              .populate('user')  
      ]);

      return res.status(200).json({
          success: true,
          total,
          appointment
      });

  } catch (err) {
      return res.status(500).json({
          success: false,
          message: "Error al obtener las citas",
          error: err
      });
  }
};


export const updateAppointment = async (req, res) => {
  try {
      const { uid } = req.params;  // El ID viene de los parámetros de la URL
      const data = req.body; // Datos a actualizar

      const appointment = await Appointment.findByIdAndUpdate(uid, data, { new: true }).populate("pet user"); // Trae los objetos completos de pet y user

      if (!appointment) {
          return res.status(404).json({
              success: false,
              msg: "Cita no encontrada",
          });
      }

      res.status(200).json({
          success: true,
          msg: "Cita actualizada correctamente",
          appointment,
      });
  } catch (err) {
      res.status(500).json({
          success: false,
          msg: "Error al actualizar la cita",
          error: err.message
      });
  }
};