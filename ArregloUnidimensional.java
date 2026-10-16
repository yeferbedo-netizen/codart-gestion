import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class ArregloUnidimensional extends JFrame {
    
    // Declaración del arreglo de tamaño 10 solicitado en la guía
    private int[] arreglo = new int[10];
    
    // Componentes de la interfaz gráfica
    private JTextField txtNumero, txtPosicion;
    private JTextArea txtResultado;
    
    public ArregloUnidimensional() {
        // Configuración de la ventana
        setTitle("Arreglo Unidimensional - SENA");
        setSize(400, 500);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(null);
        
        // Etiqueta y campo para el Número
        JLabel lblNumero = new JLabel("Número:");
        lblNumero.setBounds(30, 30, 100, 25);
        add(lblNumero);
        
        txtNumero = new JTextField();
        txtNumero.setBounds(140, 30, 200, 25);
        add(txtNumero);
        
        // Etiqueta y campo para la Posición
        JLabel lblPosicion = new JLabel("Posición (0-9):");
        lblPosicion.setBounds(30, 70, 100, 25);
        add(lblPosicion);
        
        txtPosicion = new JTextField();
        txtPosicion.setBounds(140, 70, 200, 25);
        add(txtPosicion);
        
        // Botón: Agregar Dato
        JButton btnAgregar = new JButton("Agregar Dato");
        btnAgregar.setBounds(30, 110, 310, 30);
        add(btnAgregar);
        
        // Botón: Borrar Dato
        JButton btnBorrar = new JButton("Borrar Dato (Posición)");
        btnBorrar.setBounds(30, 150, 310, 30);
        add(btnBorrar);
        
        // Botón: Limpiar Arreglo
        JButton btnLimpiar = new JButton("Limpiar Arreglo Completo");
        btnLimpiar.setBounds(30, 190, 310, 30);
        add(btnLimpiar);
        
        // Botón: Consultar Arreglo
        JButton btnConsultar = new JButton("Consultar Arreglo");
        btnConsultar.setBounds(30, 230, 310, 30);
        add(btnConsultar);
        
        // Botón: Calcular Promedio
        JButton btnPromedio = new JButton("Calcular Promedio");
        btnPromedio.setBounds(30, 270, 310, 30);
        add(btnPromedio);
        
        // Área de texto para resultados
        txtResultado = new JTextArea();
        txtResultado.setEditable(false);
        JScrollPane scroll = new JScrollPane(txtResultado);
        scroll.setBounds(30, 320, 310, 120);
        add(scroll);
        
        // --- ACCIONES DE LOS BOTONES (LÓGICA DEL PROGRAMA) ---
        
        // 1. Agregar Dato
        btnAgregar.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    int num = Integer.parseInt(txtNumero.getText());
                    int pos = Integer.parseInt(txtPosicion.getText());
                    
                    if (pos >= 0 && pos < 10) {
                        arreglo[pos] = num;
                        txtResultado.setText("Éxito: Número " + num + " guardado en la posición " + pos + ".");
                        txtNumero.setText("");
                        txtPosicion.setText("");
                    } else {
                        txtResultado.setText("Error: La posición debe estar entre 0 y 9.");
                    }
                } catch (NumberFormatException ex) {
                    txtResultado.setText("Error: Por favor ingrese números válidos.");
                }
            }
        });
        
        // 2. Borrar Dato
        btnBorrar.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    int pos = Integer.parseInt(txtPosicion.getText());
                    if (pos >= 0 && pos < 10) {
                        arreglo[pos] = 0; // Se reinicia a 0 la celda
                        txtResultado.setText("Éxito: Dato en la posición " + pos + " borrado.");
                        txtPosicion.setText("");
                    } else {
                        txtResultado.setText("Error: Posición fuera de rango (0-9).");
                    }
                } catch (NumberFormatException ex) {
                    txtResultado.setText("Error: Ingrese una posición numérica válida.");
                }
            }
        });
        
        // 3. Limpiar Arreglo
        btnLimpiar.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                for (int i = 0; i < arreglo.length; i++) {
                    arreglo[i] = 0;
                }
                txtResultado.setText("Se ha limpiado todo el arreglo (valores en 0).");
            }
        });
        
        // 4. Consultar Arreglo
        btnConsultar.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                StringBuilder sb = new StringBuilder("Contenido del Arreglo:\n");
                for (int i = 0; i < arreglo.length; i++) {
                    sb.append("Posición [").append(i).append("] = ").append(arreglo[i]).append("\n");
                }
                txtResultado.setText(sb.toString());
            }
        });
        
        // 5. Calcular Promedio
        btnPromedio.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                int suma = 0;
                for (int i = 0; i < arreglo.length; i++) {
                    suma += arreglo[i];
                }
                double promedio = (double) suma / arreglo.length;
                txtResultado.setText("La suma total es: " + suma + "\nEl promedio es: " + promedio);
            }
        });
    }

    public static void main(String[] args) {
        // Ejecutar la interfaz gráfica
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new ArregloUnidimensional().setVisible(true);
            }
        });
    }
}