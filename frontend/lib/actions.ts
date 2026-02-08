/**
 * Server Actions and Utility Functions
 * 
 * Этот файл содержит функции для работы с данными приложения.
 * Функции здесь могут быть использованы как на клиенте, так и на сервере.
 */

import type { ClothingItem } from "./types";

/**
 * Добавляет новую вещь в гардероб
 * @param item - Объект вещи для добавления
 * @returns Добавленная вещь или null при ошибке
 */
export function addWardrobeItem(item: ClothingItem): ClothingItem | null {
  try {
    // Валидация обязательных полей
    if (!item.id || !item.name || !item.category) {
      console.error("[v0] Missing required fields for wardrobe item");
      return null;
    }

    // В реальном приложении здесь была бы отправка на сервер
    // Сейчас просто возвращаем item, который будет добавлен в store на клиенте
    return item;
  } catch (error) {
    console.error("[v0] Error adding wardrobe item:", error);
    return null;
  }
}

/**
 * Удаляет вещь из гардероба
 * @param itemId - ID вещи для удаления
 * @returns true если удаление успешно
 */
export function removeWardrobeItem(itemId: string): boolean {
  try {
    if (!itemId) {
      console.error("[v0] Invalid item ID for removal");
      return false;
    }
    return true;
  } catch (error) {
    console.error("[v0] Error removing wardrobe item:", error);
    return false;
  }
}

/**
 * Обновляет информацию о вещи
 * @param item - Обновленная информация о вещи
 * @returns Обновленная вещь или null при ошибке
 */
export function updateWardrobeItem(item: ClothingItem): ClothingItem | null {
  try {
    if (!item.id) {
      console.error("[v0] Missing item ID for update");
      return null;
    }
    return item;
  } catch (error) {
    console.error("[v0] Error updating wardrobe item:", error);
    return null;
  }
}
