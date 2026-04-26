import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class For extends Nodo {
    constructor(
        public inicializacion: Nodo | null,
        public condicion: Nodo,
        public actualizacion: Nodo | null,
        public bloque: Nodo[],
        linea: number, columna: number
    ) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        // Creamos un entorno propio para el for. 
        // Esto permite que variables como i := 0 solo existan dentro del ciclo.
        const entornoFor = new Entorno(entorno);

        // 1. Ejecutar la inicialización (Solo si existe, ej. un for clásico)
        if (this.inicializacion !== null) {
            this.inicializacion.ejecutar(entornoFor);
        }

        // 2. Evaluar la condición en cada iteración
        while (true) {
            const valorCondicion = this.condicion.ejecutar(entornoFor);

            // Validar que la condición sea estrictamente un booleano
            if (typeof valorCondicion !== "boolean") {
                Singleton.getInstancia().addError("Semántico", "La condición del ciclo For debe ser una expresión booleana.", this.linea, this.columna);
                break;
            }

            // Si la condición es falsa, terminamos el ciclo
            if (!valorCondicion) {
                break;
            }

            // Creamos un entorno interno para el bloque de código iterado
            const entornoBloque = new Entorno(entornoFor);
            let romperCiclo = false;

            for (const inst of this.bloque) {
                const resultado = inst.ejecutar(entornoBloque);
                
                // Manejo de sentencias de transferencia (break, continue, return)
                if (resultado === 'break') {
                    romperCiclo = true;
                    break; // Rompe el recorrido del bloque
                }
                
                if (resultado === 'continue') {
                    break; // Rompe el recorrido del bloque, pero pasa directo a la actualización
                }
                
                if (resultado != null) {
                    return resultado; // Propaga un return hacia la función padre
                }
            }

            // Si vino un break, salimos definitivamente del while
            if (romperCiclo) {
                break;
            }

            // 3. Ejecutar la actualización (Solo si existe, ej. i++)
            if (this.actualizacion !== null) {
                this.actualizacion.ejecutar(entornoFor);
            }
        }
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="For"];\n${nombrePadre} -> ${id};\n`;
        
        // Solo graficamos la inicialización si no es nula
        if (this.inicializacion) {
            dot += this.inicializacion.obtenerAST(id);
        }

        // La condición siempre existe
        dot += this.condicion.obtenerAST(id);

        // Solo graficamos la actualización si no es nula
        if (this.actualizacion) {
            dot += this.actualizacion.obtenerAST(id);
        }
        
        // Graficamos las instrucciones del bloque
        const idBloque = `nodo_${Singleton.getInstancia().contadorAst++}`;
        dot += `${idBloque} [label="Bloque For"];\n${id} -> ${idBloque};\n`;
        this.bloque.forEach(inst => { 
            dot += inst.obtenerAST(idBloque); 
        });

        return dot;
    }
}