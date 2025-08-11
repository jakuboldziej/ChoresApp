import { useSession } from '@/app/(context)/AuthContext';
import { ChoreType, useChores } from '@/app/(context)/ChoresContext';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ChoreContextMenu from './ChoreContextMenu';

interface DisplayChoresProps {
  currentScreen?: string;
}

export default function DisplayChores({ currentScreen }: DisplayChoresProps) {
  const { user } = useSession();

  const { chores, fetchData, isLoading, handleChoreFinished } = useChores();

  const router = useRouter();
  const containerRef = useRef<View>(null);

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number; choreId?: string } | undefined>();
  const [contextMenuChore, setContextMenuChore] = useState<ChoreType>();

  const handleChorePress = (choreId: string) => {
    router.push({
      pathname: '/chore/[id]',
      params: { id: choreId }
    });
  };

  const handleMarkAsComplete = async () => {
    if (contextMenuChore && contextMenuChore._id) {
      await handleChoreFinished(contextMenuChore._id, contextMenuChore.finished ?? false);
    }
  };

  const handleEdit = () => {
    if (contextMenuPos?.choreId) {
      console.log('Edit chore:', contextMenuPos.choreId);
    }
  };

  const handleDelete = () => {
    console.log('Delete chore:', contextMenuPos?.choreId);
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

    if (currentScreen === "index") {
      return chores.filter(chore => chore.finished !== true);
    }

    return chores;
  }, [chores, currentScreen]);

  return (
    <View ref={containerRef} style={{ flex: 1 }}>
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
            className={`w-full p-4 rounded-xl mb-3 ${chore.finished === true ? "bg-yellow-400" : "bg-cyan-200"}`}
            onPress={() => chore._id && handleChorePress(chore._id)}
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
            <Text className='text-xl font-semibold'>{chore.title}</Text>
            <Text
              className='text-sm overflow-hidden'
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {chore.description}
            </Text>
          </TouchableOpacity>
        ))}

        {contextMenuPos && contextMenuChore && (
          <ChoreContextMenu
            x={contextMenuPos.x}
            y={contextMenuPos.y}
            contextMenuChore={contextMenuChore}
            onMarkAsComplete={handleMarkAsComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={closeContextMenu}
          />
        )}
      </ScrollView>
    </View>
  )
} 