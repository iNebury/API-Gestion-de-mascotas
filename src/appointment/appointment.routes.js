import { Router } from "express";
import { saveAppointment , getAppointment ,updateAppointment} from "./appointment.controller.js";
import { createAppointmentValidator, updateAppointmentValidator } from "../middlewares/appointment-validators.js";

const router = Router();

router.post("/createAppointment", createAppointmentValidator, saveAppointment);

router.get("/getAppointment/", getAppointment);

router.patch("/updateAppointment/:uid", updateAppointmentValidator, updateAppointment);

export default router;