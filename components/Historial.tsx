import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext'; // Importamos el hook del tema
import { Transaction } from '../types';

const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) amount = 0;
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(amount);
};

// --- Iconos SVG para los botones ---
const EditIcon = ({ color }: { color: string }) => (
    <Svg height="20" width="20" viewBox="0 0 20 20" fill={color}>
        <Path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <Path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </Svg>
);

const DeleteIcon = ({ color }: { color: string }) => (
    <Svg height="20" width="20" viewBox="0 0 20 20" fill={color}>
        <Path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </Svg>
);

// --- Props del componente ---
interface HistorialProps {
  transactions: Transaction[];
  categories: string[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onFilter: (filter: string) => void;
  activeFilter: string;
}

const Historial: React.FC<HistorialProps> = ({ transactions, categories, onDelete, onEdit, onFilter, activeFilter }) => {
    const { colors } = useTheme(); // Usamos el hook para obtener los colores
    
    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={[styles.itemContainer, { backgroundColor: item.type === 'ingreso' ? colors.notification + '15' : colors.destructive + '15' }]}>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemDescription, { color: colors.text }]}>{item.description}</Text>
                <View style={styles.metaContainer}>
                    {item.category && (
                        <View style={[styles.categoryBadge, { backgroundColor: colors.background }]}>
                            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{item.category}</Text>
                        </View>
                    )}
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
            </View>
            <View style={styles.itemActions}>
                <Text style={item.type === 'ingreso' ? styles.incomeAmount : styles.expenseAmount}>
                    {item.type === 'ingreso' ? '+' : '-'}{formatCurrency(item.amount)}
                </Text>
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                    <EditIcon color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}>
                    <DeleteIcon color={colors.destructive} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>Historial de Movimientos</Text>
            
            <View style={styles.filterContainer}>
                <TouchableOpacity 
                    style={[styles.filterButton, { backgroundColor: colors.background }, activeFilter === 'todos' && { backgroundColor: colors.primary }]}
                    onPress={() => onFilter('todos')}
                >
                    <Text style={[styles.filterText, { color: colors.textSecondary }, activeFilter === 'todos' && styles.filterActiveText]}>Todos</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                    <TouchableOpacity 
                        key={cat}
                        style={[styles.filterButton, { backgroundColor: colors.background }, activeFilter === cat && { backgroundColor: colors.primary }]}
                        onPress={() => onFilter(cat)}
                    >
                        <Text style={[styles.filterText, { color: colors.textSecondary }, activeFilter === cat && styles.filterActiveText]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay movimientos para mostrar.</Text>}
                contentContainerStyle={{ paddingBottom: 20 }}
                scrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        borderRadius: 20,
        marginTop: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 8,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 16,
    },
    filterActiveText: {
        color: 'white',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    itemInfo: {
        flex: 1,
    },
    itemDescription: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryBadge: {
        borderRadius: 10,
        paddingVertical: 3,
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
    },
    dateText: {
        fontSize: 12,
        fontWeight: '500',
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    incomeAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#16a34a',
        minWidth: 90,
        textAlign: 'right',
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#dc2626',
        minWidth: 90,
        textAlign: 'right',
    },
    actionButton: {
        padding: 8,
        marginLeft: 8,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
    },
});

export default Historial;
