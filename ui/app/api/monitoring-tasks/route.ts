import { NextRequest, NextResponse } from "next/server";
import { MonitoringTask } from "../../../../db/models/MonitoringTask";

const SERVER_ID = 45;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { itemId, checkFrequencySec } = body;

  if (!itemId || typeof itemId !== "number") {
    return NextResponse.json(
      { error: "itemId is required and must be a number" },
      { status: 400 },
    );
  }

  if (!checkFrequencySec || typeof checkFrequencySec !== "number") {
    return NextResponse.json(
      { error: "checkFrequencySec is required and must be a number" },
      { status: 400 },
    );
  }

  // Check for duplicate
  const existing = await MonitoringTask.findOne({
    serverId: SERVER_ID,
    itemId: itemId,
  });

  if (existing) {
    return NextResponse.json(
      { error: "A monitoring task for this item already exists" },
      { status: 409 },
    );
  }

  // Create new monitoring task
  const task = await MonitoringTask.create({
    serverId: SERVER_ID,
    itemId: itemId,
    checkFrequencySec: checkFrequencySec,
    // lastCheckedAt: null,
  });

  return NextResponse.json({
    success: true,
    task: {
      _id: task._id,
      serverId: task.serverId,
      itemId: task.itemId,
      checkFrequencySec: task.checkFrequencySec,
    },
  });
}
