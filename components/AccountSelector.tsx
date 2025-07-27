import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Account } from '../types';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ accounts, selectedAccountId, onSelectAccount }) => {
  const { colors } = useTheme();

  if (accounts.length <= 1) {
    return null; // No mostrar el selector si hay 1 o 0 cuentas
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {accounts.map(account => {
          const isSelected = account.id === selectedAccountId;
          return (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.accountChip,
                { 
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                }
              ]}
              onPress={() => onSelectAccount(account.id)}
            >
              <View style={[styles.accountColorDot, { backgroundColor: account.color || colors.primary }]} />
              <Text style={[styles.accountName, { color: isSelected ? 'white' : colors.text }]}>
                {account.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    marginTop: 15
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  accountColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AccountSelector;