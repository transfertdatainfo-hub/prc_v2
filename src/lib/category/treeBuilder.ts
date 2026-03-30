// src/lib/category/treeBuilder.ts

import { RSSFeed } from '@/types/RSSFeed';
import { CategoryNode } from '@/types/CategoryNode';

/**
 * Construit un arbre de catégories à partir d'une liste plate de RSSFeeds
 */
export function buildCategoryTree(feeds: RSSFeed[]): CategoryNode[] {
  // Créer un map des nœuds par ID
  const nodeMap = new Map<string, CategoryNode>();
  
  // Initialiser tous les nœuds
  feeds.forEach(feed => {
    nodeMap.set(feed.id, {
      id: feed.id,
      title: feed.title,
      url: feed.url,
      nodeType: feed.nodeType,
      sourceId: feed.sourceId,
      sourceName: feed.source?.name,
      parentId: feed.parentId,
      children: [],
      isExpanded: true,
      level: 0,
    });
  });
  
  // Construire l'arbre et propager les sourceId aux enfants qui n'en ont pas
  const roots: CategoryNode[] = [];
  
  nodeMap.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!;
      parent.children.push(node);
      node.level = (parent.level || 0) + 1;
      
      // PROPAGATION DE LA SOURCE : si l'enfant n'a pas de source, prendre celle du parent
      if (!node.sourceId && parent.sourceId) {
        node.sourceId = parent.sourceId;
        node.sourceName = parent.sourceName;
      }
    } else {
      roots.push(node);
    }
  });
  
  // Trier les nœuds (catégories d'abord, puis flux)
  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => {
      if (a.nodeType !== b.nodeType) {
        return a.nodeType === 'category' ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    });
    nodes.forEach(node => sortNodes(node.children));
  };
  
  sortNodes(roots);
  
  return roots;
}

/**
 * Récupère tous les flux (nodeType = 'feed') à partir de l'arbre
 */
export function getAllFeedsFromTree(tree: CategoryNode[]): CategoryNode[] {
  const feeds: CategoryNode[] = [];
  
  const traverse = (nodes: CategoryNode[]) => {
    nodes.forEach(node => {
      if (node.nodeType === 'feed') {
        feeds.push(node);
      }
      if (node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  
  traverse(tree);
  return feeds;
}

/**
 * Compte le nombre total d'articles dans un nœud et ses enfants
 */
export function countArticlesInNode(node: CategoryNode, articleCountMap: Map<string, number>): number {
  let count = articleCountMap.get(node.id) || 0;
  
  node.children.forEach(child => {
    count += countArticlesInNode(child, articleCountMap);
  });
  
  return count;
}