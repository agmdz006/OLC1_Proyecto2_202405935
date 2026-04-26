import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Imprimir extends Nodo {
    constructor(public expresiones: Nodo[], public saltoLinea: boolean, linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const valores = this.expresiones.map(expr => expr.ejecutar(entorno));
        const texto = valores.join(" ") + (this.saltoLinea ? "\n" : "");
        
        // Usamos el Singleton para imprimir en la consola global
        Singleton.getInstancia().addConsola(texto);
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="fmt.Print${this.saltoLinea ? 'ln' : ''}"];\n${nombrePadre} -> ${id};\n`;
        this.expresiones.forEach(expr => { dot += expr.obtenerAST(id); });
        return dot;
    }
}