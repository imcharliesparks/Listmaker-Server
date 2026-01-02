import { Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../config/prisma';
import urlMetadataService from '../services/urlMetadataService';

const serializeItem = (item: any) => ({
  id: item.id,
  list_id: item.listId,
  url: item.url,
  title: item.title,
  description: item.description,
  thumbnail_url: item.thumbnailUrl,
  source_type: item.sourceType,
  metadata: item.metadata,
  position: item.position,
  created_at: item.createdAt,
  updated_at: item.updatedAt,
});

export const addItem = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { listId, url } = req.body;

    if (!listId || !url) {
      return res.status(400).json({ error: 'List ID and URL are required' });
    }
    const listIdNum = Number(listId);
    if (Number.isNaN(listIdNum)) {
      return res.status(400).json({ error: 'List ID must be a number' });
    }
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Verify list belongs to user
    const listCheck = await prisma.list.findFirst({
      where: { id: listIdNum, userId: uid },
    });

    if (!listCheck) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Extract metadata from URL
    const metadata = await urlMetadataService.extractMetadata(url);

    // Get next position
    const positionResult = await prisma.item.aggregate({
      where: { listId: listIdNum },
      _max: { position: true },
    });
    const nextPosition = (positionResult._max.position ?? -1) + 1;

    // Insert item
    const item = await prisma.item.create({
      data: {
        listId: listIdNum,
        url,
        title: metadata.title ?? null,
        description: metadata.description ?? null,
        thumbnailUrl: metadata.thumbnail ?? null,
        sourceType: metadata.sourceType ?? null,
        metadata: metadata.metadata ?? null,
        position: nextPosition,
      },
    });

    res.status(201).json({ item: serializeItem(item) });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
};

export const getListItems = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { listId } = req.params;
    const listIdNum = Number(listId);
    if (Number.isNaN(listIdNum)) {
      return res.status(400).json({ error: 'Invalid list id' });
    }

    // Verify list belongs to user
    const listCheck = await prisma.list.findFirst({
      where: { id: listIdNum, userId: uid },
    });

    if (!listCheck) {
      return res.status(404).json({ error: 'List not found' });
    }

    const result = await prisma.item.findMany({
      where: { listId: listIdNum },
      orderBy: { position: 'asc' },
    });

    res.json({ items: result.map(serializeItem) });
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { id } = req.params;
    const itemId = Number(id);

    if (Number.isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid item id' });
    }

    // Verify item belongs to user's list
    const itemCheck = await prisma.item.findUnique({
      where: { id: itemId },
      include: { list: true },
    });

    if (!itemCheck || itemCheck.list.userId !== uid) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await prisma.item.delete({ where: { id: itemId } });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};
