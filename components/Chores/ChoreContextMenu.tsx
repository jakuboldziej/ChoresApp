import { useSession } from '@/app/(context)/AuthContext';
import { ChoreType } from '@/app/(context)/ChoresContext';
import { isChoreFinishedByUser } from '@/lib/choreUtils';
import React from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';

interface ChoreContextMenuProps {
  x: number;
  y: number;
  contextMenuChore: ChoreType;
  onMarkCompletion?: () => void;
  onOpenChore?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}

export default function ChoreContextMenu({
  x,
  y,
  contextMenuChore,
  onMarkCompletion: onMarkAsComplete,
  onOpenChore,
  onEdit,
  onDelete,
  onClose
}: ChoreContextMenuProps) {
  const { user } = useSession();

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const menuWidth = 200;
  const menuHeight = 150;

  let adjustedX = x - 25;
  let adjustedY = y;

  if (adjustedX + menuWidth > screenWidth) adjustedX = screenWidth - menuWidth - 10;

  if (adjustedX < 10) adjustedX = 10;

  if (adjustedY + menuHeight > screenHeight) adjustedY = screenHeight - menuHeight - 10;

  if (adjustedY < 10) adjustedY = 10;

  const handleAction = (action: () => void) => {
    action();
    onClose?.();
  };

  return (
    <View
      className="absolute bg-white rounded-lg p-2 min-w-[180px] shadow-lg"
      style={{
        top: adjustedY,
        left: adjustedX,
        position: "absolute",
        zIndex: 9999,
        elevation: 10, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
    >
      <Pressable
        className="py-3 px-4 rounded active:bg-gray-100"
        onPress={(e) => {
          e.stopPropagation();
          onOpenChore && onOpenChore();
        }}
      >
        <Text className="text-base text-gray-800 text-center">
          Szczegóły
        </Text>
      </Pressable>

      <View className="h-px bg-gray-300 mx-2" />

      <Pressable
        className="py-3 px-4 rounded active:bg-gray-100"
        onPress={(e) => {
          e.stopPropagation();
          onMarkAsComplete && handleAction(onMarkAsComplete);
        }}
      >
        <Text className="text-base text-gray-800 text-center">
          Oznacz jako{user && isChoreFinishedByUser(contextMenuChore, user.displayName) && " nie"} wykonane
        </Text>
      </Pressable>

      <View className="h-px bg-gray-300 mx-2" />

      <Pressable
        className="py-3 px-4 rounded active:bg-gray-100"
        onPress={(e) => {
          e.stopPropagation();
          onEdit && handleAction(onEdit);
        }}
      >
        <Text className="text-base text-gray-800 text-center">Edytuj</Text>
      </Pressable>

      <View className="h-px bg-gray-300 mx-2" />

      <Pressable
        className="py-3 px-4 rounded active:bg-gray-100"
        onPress={(e) => {
          e.stopPropagation();
          onDelete && handleAction(onDelete);
        }}
      >
        <Text className="text-base text-red-500 text-center">Usuń</Text>
      </Pressable>
    </View>
  )
}