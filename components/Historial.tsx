import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { Transaction } from '../types';

// Helper function para formatear a CLP
const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) amount = 0;
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(amount);
};

// --- Iconos SVG para los botones ---
const EditIcon = () => (
    <Svg height="20" width="20" viewBox="0 0 20 20" fill="#6b7280">
        <Path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <Path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </Svg>
);

const DeleteIcon = () => (
    <Svg height="20" width="20" viewBox="0 0 20 20" fill="#ef4444">
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
    
    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={[styles.itemContainer, item.type === 'ingreso' ? styles.incomeBg : styles.expenseBg]}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemDescription}>{item.description}</Text>
                {item.category && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                )}
            </View>
            <View style={styles.itemActions}>
                <Text style={item.type === 'ingreso' ? styles.incomeAmount : styles.expenseAmount}>
                    {item.type === 'ingreso' ? '+' : '-'}{formatCurrency(item.amount)}
                </Text>
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                    <EditIcon />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}>
                    <DeleteIcon />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Historial de Movimientos</Text>
            
            <View style={styles.filterContainer}>
                <TouchableOpacity 
                    style={[styles.filterButton, activeFilter === 'todos' && styles.filterActive]}
                    onPress={() => onFilter('todos')}
                >
                    <Text style={[styles.filterText, activeFilter === 'todos' && styles.filterActiveText]}>Todos</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                    <TouchableOpacity 
                        key={cat}
                        style={[styles.filterButton, activeFilter === cat && styles.filterActive]}
                        onPress={() => onFilter(cat)}
                    >
                        <Text style={[styles.filterText, activeFilter === cat && styles.filterActiveText]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay movimientos para mostrar.</Text>}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        marginTop: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#1e293b',
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
        backgroundColor: '#e2e8f0',
        borderRadius: 16,
    },
    filterActive: {
        backgroundColor: '#3b82f6',
    },
    filterText: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    filterActiveText: {
        color: 'white',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    incomeBg: {
        backgroundColor: 'rgba(22, 163, 74, 0.08)',
    },
    expenseBg: {
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
    },
    itemInfo: {
        flex: 1,
    },
    itemDescription: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
    },
    categoryBadge: {
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
        paddingVertical: 3,
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    categoryText: {
        fontSize: 12,
        color: '#64748b',
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
        color: '#64748b',
        fontSize: 16,
    },
});

export default Historial;
