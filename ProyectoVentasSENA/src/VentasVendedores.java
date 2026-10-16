import java.util.Scanner;

public class VentasVendedores {
    public static void main(String[] args) {
        // Scanner para leer lo que el usuario escribe en la consola
        Scanner scanner = new Scanner(System.in);

        System.out.println("=== SISTEMA DE GESTION DE VENTAS ANUALES ===");
        System.out.print("Ingrese la cantidad de vendedores: ");
        int cantidadVendedores = scanner.nextInt();
        scanner.nextLine(); // Limpiar el buffer de entrada

        // 1. Arreglo unidimensional para los nombres
        String[] nombres = new String[cantidadVendedores];

        // 2. Arreglo bidimensional (matriz) para las ventas: 
        // Las filas son los vendedores y las columnas son los 4 trimestres.
        double[][] ventas = new double[cantidadVendedores][4];

        // Ciclo para capturar la información de cada vendedor
        for (int i = 0; i < cantidadVendedores; i++) {
            System.out.println("\n--- Vendedor " + (i + 1) + " ---");
            System.out.print("Ingrese el nombre del vendedor: ");
            nombres[i] = scanner.nextLine();

            // Ciclo interno para pedir las ventas de los 4 trimestres
            for (int j = 0; j < 4; j++) {
                System.out.print("Ingrese las ventas del Trimestre " + (j + 1) + ": $");
                ventas[i][j] = scanner.nextDouble();
            }
            scanner.nextLine(); // Limpiar buffer
        }

        System.out.println("\n========================================");
        System.out.println("          INFORME DE PROMEDIOS          ");
        System.out.println("========================================");

        double sumaTotalGeneral = 0;
        int totalTrimestresGlobal = cantidadVendedores * 4;

        // Ciclo para procesar y mostrar los resultados por vendedor
        for (int i = 0; i < cantidadVendedores; i++) {
            double sumaVendedor = 0;

            // Sumamos los 4 trimestres del vendedor actual
            for (int j = 0; j < 4; j++) {
                sumaVendedor += ventas[i][j];
            }

            // Calculamos el promedio del vendedor individual
            double promedioVendedor = sumaVendedor / 4;

            // Acumulamos para el promedio global
            sumaTotalGeneral += sumaVendedor;

            // Mostramos el informe individual
            System.out.println("Vendedor: " + nombres[i]);
            System.out.println(" -> Promedio de los 4 trimestres: $" + promedioVendedor);
            System.out.println("----------------------------------------");
        }

        // Calculamos y mostramos el promedio global de todos los vendedores
        double promedioGlobal = sumaTotalGeneral / totalTrimestresGlobal;
        System.out.println("\n[INFORME GLOBAL]");
        System.out.println("Promedio general de todos los vendedores: $" + promedioGlobal);
        System.out.println("========================================");

        scanner.close();
    }
}