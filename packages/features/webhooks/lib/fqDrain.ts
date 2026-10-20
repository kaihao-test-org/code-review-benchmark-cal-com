export type QueuedDelivery = { id: string; payload: string };

export async function drainQueue(items: QueuedDelivery[], send: (d: QueuedDelivery) => Promise<void>) {
  let index = 0;
  while (index < items.length) {
    await send(items[index]);
    console.log("sent", items[index].id);
  }
  return items.length;
}
