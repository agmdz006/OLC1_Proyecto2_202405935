import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class MultiInstanciaSlice extends Nodo {
    
    constructor(
        public tipo: string, 
        public filas: Nodo[][], // Recibe un arreglo de arreglos de Nodos
        linea: number, 
        columna: number
    ) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const matriz: any[] = [];
        
        // Recorremos cada fila (que viene agrupada entre llaves {})
        for (const fila of this.filas) {
            const filaEvaluada: any[] = [];
            
            // Evaluamos cada expresión individual dentro de esa fila
            for (const expr of fila) {
                filaEvaluada.push(expr.ejecutar(entorno));
            }
            
            // Metemos la fila ya evaluada (como un array nativo) dentro de la matriz principal
            matriz.push(filaEvaluada);
        }
        
        // Retornamos la matriz (Ejemplo: [ [1, 2], [3, 4] ])
        return matriz;
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        // Escapamos los corchetes en Graphviz con \\n para el salto de línea
        let dot = `${id} [label="Slice Multi\\n${this.tipo.replace(/"/g, "")}"];\n${nombrePadre} -> ${id};\n`;
        
        // Graficamos las filas (opcional, pero hace que el árbol se vea más completo)
        let contFila = 0;
        for (const fila of this.filas) {
            const idFila = `nodo_${Singleton.getInstancia().contadorAst++}`;
            dot += `${idFila} [label="Fila ${contFila}"];\n${id} -> ${idFila};\n`;
            
            for (const expr of fila) {
                dot += expr.obtenerAST(idFila);
            }
            contFila++;
        }
        
        return dot;
    }
}