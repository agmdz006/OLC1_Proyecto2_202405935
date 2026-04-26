import { ErrorCompilacion } from "./Errores";

export class Singleton {
    private static instancia: Singleton;
    public consola: string = "";
    public errores: ErrorCompilacion[] = [];
    public contadorAst: number = 0; 

    private constructor() {}

    public static getInstancia(): Singleton {
        if (!Singleton.instancia) {
            Singleton.instancia = new Singleton();
        }
        return Singleton.instancia;
    }

    // --- MÉTODOS PARA AGREGAR INFORMACIÓN ---
    public addConsola(texto: string) {
        this.consola += texto;
    }

    public addError(tipo: string, descripcion: string, linea: number, columna: number) {
        this.errores.push(new ErrorCompilacion(tipo, descripcion, linea, columna));
    }

    // --- MÉTODOS PARA OBTENER INFORMACIÓN ---
    public getConsola(): string {
        return this.consola;
    }

    public getErrores(): ErrorCompilacion[] {
        return this.errores;
    }

    // --- MÉTODO PARA LIMPIAR ---
    public reset() {
        this.consola = "";
        this.errores = [];
        this.contadorAst = 0;
    }
}