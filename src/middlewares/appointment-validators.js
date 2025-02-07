import { body,check} from "express-validator";
import { validarCampos} from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";


export const createAppointmentValidator = [
    body("date").notEmpty().withMessage("La fecha es requerida"),
    body("pet").notEmpty().withMessage("La mascota es requerida"),
    body("pet").isMongoId().withMessage("No es un ID válido de MongoDB"),
    validarCampos,
    handleErrors
];

export const getAppointmentByIdValidator = [
    check("uid").isMongoId().withMessage("Este ID no es Valido"),
    validarCampos,
    handleErrors
];

export const updateAppointmentValidator = [
    check("uid").isMongoId().withMessage("Este ID no es valido"),
    check("pet", "No es un Id válido").isMongoId(),
    check("user","No es un Id válido").isMongoId(),
    validarCampos,
    handleErrors
]