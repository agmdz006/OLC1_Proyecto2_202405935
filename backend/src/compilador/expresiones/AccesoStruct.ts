import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class AccesoStruct extends Nodo {
    constructor(public expresion: Nodo, public propiedad: string, linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        // Evaluamos la parte izquierda (Ej. "vehiculo" o "vehiculo.motor")
        const objeto = this.expresion.ejecutar(entorno);

        if (objeto == null || typeof objeto !== 'object') {
            Singleton.getInstancia().addError("Semántico", `No se puede acceder a la propiedad '${this.propiedad}' porque la variable no es un Struct.`, this.linea, this.columna);
            return null;
        }

        // Retornamos el valor de la propiedad
        return objeto[this.propiedad];
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        return `${id} [label="Acceso .${this.propiedad}"];\n${nombrePadre} -> ${id};\n`;
    }
}