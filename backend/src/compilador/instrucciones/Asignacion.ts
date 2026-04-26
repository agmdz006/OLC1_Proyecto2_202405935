import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Asignacion extends Nodo {
    // IMPORTANTE: Cambiamos 'id: string' por 'id: any' porque ahora recibe nodos complejos
    constructor(public id: any, public expresion: Nodo, linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        // 1. Ejecutamos la expresión de la derecha para obtener el valor final a guardar
        const nuevoValor = this.expresion.ejecutar(entorno);

        // ----------------------------------------------------------------------
        // CASO A: ASIGNAR A UN SLICE (Ej: arreglo[0] = 5)
        // ----------------------------------------------------------------------
        // Verificamos si el lado izquierdo es un AccesoSlice (revisando si tiene la propiedad 'indice')
        if (this.id.indice !== undefined) {
            // Obtenemos el arreglo original y el índice que queremos modificar
            const arreglo = this.id.expresion.ejecutar(entorno);
            const index = this.id.indice.ejecutar(entorno);

            if (Array.isArray(arreglo)) {
                arreglo[index] = nuevoValor; // ¡Modificamos la memoria directamente!
                return;
            } else {
                Singleton.getInstancia().addError("Semántico", "No se puede asignar: no es un Slice.", this.linea, this.columna);
                return;
            }
        }

        // ----------------------------------------------------------------------
        // CASO B: ASIGNAR A UN STRUCT (Ej: vehiculo.marca = "Toyota")
        // ----------------------------------------------------------------------
        // Verificamos si el lado izquierdo es un AccesoStruct (revisando si tiene 'propiedad')
        if (this.id.propiedad !== undefined) {
            // Obtenemos el objeto base
            const objeto = this.id.expresion.ejecutar(entorno);
            
            if (typeof objeto === 'object' && objeto !== null) {
                objeto[this.id.propiedad] = nuevoValor; // ¡Modificamos el atributo directamente!
                return;
            } else {
                Singleton.getInstancia().addError("Semántico", "No se puede asignar: no es un Struct.", this.linea, this.columna);
                return;
            }
        }

        // ----------------------------------------------------------------------
        // CASO C: ASIGNACIÓN NORMAL (Ej: x = 10)
        // ----------------------------------------------------------------------
        let nombreReal = "";
        if (typeof this.id === 'string') {
            nombreReal = this.id;
        } else if (this.id.id !== undefined) { 
            // Si Jison mandó un nodo AccesoVariable
            nombreReal = this.id.id;
        }

        if (nombreReal !== "") {
            const actualizado = entorno.actualizar(nombreReal, nuevoValor);
            if (!actualizado) {
                Singleton.getInstancia().addError("Semántico", `Variable '${nombreReal}' no encontrada para asignar.`, this.linea, this.columna);
            }
        } else {
            Singleton.getInstancia().addError("Semántico", "Asignación inválida.", this.linea, this.columna);
        }
    }

    obtenerAST(nombrePadre: string): string {
        let nombreReal = "Estructura";
        if (typeof this.id === 'string') {
            nombreReal = this.id;
        } else if (this.id.id !== undefined) {
            nombreReal = this.id.id;
        } else if (this.id.propiedad !== undefined) {
            nombreReal = `.${this.id.propiedad}`;
        } else if (this.id.indice !== undefined) {
            nombreReal = `[]`;
        }
        
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="Asignacion\\n${nombreReal}"];\n${nombrePadre} -> ${id};\n`;
        
        // Si el lado izquierdo es un nodo complejo (Slice/Struct), lo graficamos
        if (typeof this.id !== 'string') {
            dot += this.id.obtenerAST(id);
        }
        
        // Graficamos la expresión asignada
        dot += this.expresion.obtenerAST(id);
        
        return dot;
    }
}