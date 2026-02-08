import { useSession } from '@/app/(context)/AuthContext';
import { ChoreType, useChores } from '@/app/(context)/ChoresContext';
import { isChoreUnfinishedByUser } from '@/lib/choreUtils';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ChoreContextMenu from './ChoreContextMenu';
import ChoreModal from './ChoreModal';

interface DisplayChoresProps {
  currentScreen?: "index" | "chores-screen" | "chores-daily";
  pFinished?: boolean | null;
}

export default function DisplayChores({ currentScreen, pFinished = null }: DisplayChoresProps) {
  const { user } = useSession();

  const { chores, fetchData, isLoading, handleChoreFinished, handleChoreDelete } = useChores();

  const router = useRouter();
  const containerRef = useRef<View>(null);

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number; choreId?: string } | undefined>();
  const [contextMenuChore, setContextMenuChore] = useState<ChoreType>();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingChore, setEditingChore] = useState<ChoreType | null>(null);

  const openChore = () => {
    if (contextMenuChore && contextMenuChore._id && user) {
      router.push({
        pathname: '/chore/[id]',
        params: { id: contextMenuChore._id }
      });
    };
  }

  const handleMarkCompletion = async () => {
    if (contextMenuChore && contextMenuChore._id && user) {
      await handleChoreFinished(contextMenuChore._id, user.displayName);
    }
  };

  const handleEdit = () => {
    if (contextMenuChore) {
      setEditingChore(contextMenuChore);
      setIsEditModalVisible(true);
      closeContextMenu();
    }
  };

  const handleDelete = () => {
    if (contextMenuChore && contextMenuChore._id) {
      handleChoreDelete(contextMenuChore._id, false);
    }
  };

  const closeContextMenu = () => {
    setContextMenuPos(undefined);
  };

  const onRefresh = async () => {
    try {
      if (!user?._id) throw new Error("Użytkownik jest wymagany");

      await fetchData({
        userId: user._id
      });
    } catch (error) {
      console.error('Error refreshing chores:', error);
    }
  }

  const filteredChores = useMemo(() => {
    if (!chores) return [];

    if (!user?.displayName) return;

    if (currentScreen === "index") {
      return chores.filter(
        chore => isChoreUnfinishedByUser(chore, user.displayName) && !chore.isRepeatable
      );
    } else if (currentScreen === "chores-screen") {
      return chores.filter(
        chore => !chore.isRepeatable
      );
    } else if (currentScreen === "chores-daily") {
      let filterFinished = pFinished;

      return chores.filter(
        chore => chore.isRepeatable === true && chore.finished === filterFinished
      );
    }

    return chores;
  }, [chores, currentScreen, pFinished, user?.displayName]);

  return (
    <View ref={containerRef} style={{ flex: 1, position: 'relative' }}>
      <ScrollView
        className='w-full flex-1'
        contentContainerStyle={{ flexGrow: 1, padding: 12 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        onTouchStart={() => setContextMenuPos(undefined)}
      >
        {filteredChores && filteredChores.length > 0 && filteredChores.map((chore) => (
          <TouchableOpacity
            key={chore._id}
            style={{ elevation: 5 }}
            className={`flex flex-row items-center gap-3 w-full p-4 rounded-xl mb-3 ${chore.finished === true ? "bg-green-200" : "bg-cyan-200"}`}
            onPress={() => {
              setContextMenuChore(chore);
              handleMarkCompletion();
            }}
            onLongPress={(e) => {
              const { pageX, pageY } = e.nativeEvent;

              containerRef.current?.measureInWindow((x: number, y: number) => {
                setContextMenuPos({
                  x: pageX - x,
                  y: pageY - y,
                  choreId: chore._id
                });
                setContextMenuChore(chore);
              });
            }}
          >
            <View className={`w-7 h-7 rounded-full justify-center items-center ${chore.finished ? "bg-green-500" : "border"}`}>
              {chore.finished === true && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color="white"
                  style={{ position: 'absolute', zIndex: 50 }}
                />
              )}
            </View>
            <Text className='text-xl font-semibold'>{chore.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {contextMenuPos && contextMenuChore && (
        <ChoreContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          contextMenuChore={contextMenuChore}
          onMarkCompletion={handleMarkCompletion}
          onOpenChore={openChore}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={closeContextMenu}
        />
      )}

      <ChoreModal
        isVisible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setEditingChore(null);
        }}
        mode="edit"
        editChore={editingChore}
      >
        <></>
      </ChoreModal>
    </View>
  )
} 