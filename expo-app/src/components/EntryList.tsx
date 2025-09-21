import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, IconButton, Text, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface EntryListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: string;
  rightText?: string;
}

interface EntryListProps {
  items: EntryListItem[];
  onItemPress?: (item: EntryListItem) => void;
  onEdit?: (item: EntryListItem) => void;
  onDelete?: (item: EntryListItem) => void;
  onDuplicate?: (item: EntryListItem) => void;
  emptyStateText?: string;
  emptyStateSubtext?: string;
  loading?: boolean;
}

const EntryList: React.FC<EntryListProps> = ({
  items,
  onItemPress,
  onEdit,
  onDelete,
  onDuplicate,
  emptyStateText = "No hay entradas",
  emptyStateSubtext = "Agrega tu primera entrada usando el botón +",
  loading = false
}) => {

  const renderItem = ({ item }: { item: EntryListItem }) => (
    <Card style={styles.itemCard}>
      <List.Item
        title={item.title}
        description={item.subtitle}
        left={(props) => (
          <List.Icon 
            {...props} 
            icon={item.leftIcon || "fitness-center"} 
            color="#283750"
          />
        )}
        right={() => (
          <View style={styles.rightActions}>
            {item.rightText && (
              <Text style={styles.rightText}>{item.rightText}</Text>
            )}
            <View style={styles.actionButtons}>
              {onDuplicate && (
                <IconButton
                  icon="content-copy"
                  size={20}
                  onPress={() => onDuplicate(item)}
                  iconColor="#666666"
                />
              )}
              {onEdit && (
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => onEdit(item)}
                  iconColor="#283750"
                />
              )}
              {onDelete && (
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => onDelete(item)}
                  iconColor="#D32F2F"
                />
              )}
            </View>
          </View>
        )}
        onPress={() => onItemPress?.(item)}
        style={styles.listItem}
      />
      {item.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      )}
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="inbox" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateText}>{emptyStateText}</Text>
      <Text style={styles.emptyStateSubtext}>{emptyStateSubtext}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.container,
        items.length === 0 && styles.emptyContainer
      ]}
      ListEmptyComponent={renderEmptyState}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemCard: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  listItem: {
    paddingVertical: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    fontSize: 12,
    color: '#666666',
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  description: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default EntryList;