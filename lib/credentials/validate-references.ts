import mongoose from "mongoose";

import Category from "@/models/Category";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Tag from "@/models/Tag";

interface ValidateCredentialReferencesParams {
  ownerId: mongoose.Types.ObjectId;
  clientId: string;
  projectIds: string[];
  categoryId: string;
  tagIds: string[];
  isShared: boolean;
}

export async function validateCredentialReferences({
  ownerId,
  clientId,
  projectIds,
  categoryId,
  tagIds,
  isShared,
}: ValidateCredentialReferencesParams) {
  /**
   * Validate Client ID.
   */
  if (!mongoose.isValidObjectId(clientId)) {
    throw new ReferenceValidationError("Invalid client ID.");
  }

  const client = await Client.findOne({
    _id: clientId,
    owner: ownerId,
  }).select("_id");

  if (!client) {
    throw new ReferenceValidationError("Client not found.");
  }

  /**
   * Project rules:
   *
   * Normal credential:
   * exactly one project.
   *
   * Shared credential:
   * at least two projects.
   */
  if (!isShared && projectIds.length !== 1) {
    throw new ReferenceValidationError(
      "A non-shared credential must belong to exactly one project.",
    );
  }

  if (isShared && projectIds.length < 2) {
    throw new ReferenceValidationError(
      "A shared credential must belong to at least two projects.",
    );
  }

  /**
   * Validate all project IDs.
   */
  const uniqueProjectIds = [...new Set(projectIds)];

  for (const projectId of uniqueProjectIds) {
    if (!mongoose.isValidObjectId(projectId)) {
      throw new ReferenceValidationError(
        "One or more project IDs are invalid.",
      );
    }
  }

  const projects = await Project.find({
    _id: { $in: uniqueProjectIds },
    owner: ownerId,
    client: client._id,
  })
    .select("_id")
    .lean();

  if (projects.length !== uniqueProjectIds.length) {
    throw new ReferenceValidationError(
      "One or more projects do not belong to this client.",
    );
  }

  /**
   * Validate Category.
   */
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new ReferenceValidationError("Invalid category ID.");
  }

  const category = await Category.findOne({
    _id: categoryId,
    owner: ownerId,
  }).select("_id");

  if (!category) {
    throw new ReferenceValidationError("Category not found.");
  }

  /**
   * Validate Tags.
   */
  const uniqueTagIds = [...new Set(tagIds)];

  for (const tagId of uniqueTagIds) {
    if (!mongoose.isValidObjectId(tagId)) {
      throw new ReferenceValidationError("One or more tag IDs are invalid.");
    }
  }

  if (uniqueTagIds.length > 0) {
    const tags = await Tag.find({
      _id: { $in: uniqueTagIds },
      owner: ownerId,
    })
      .select("_id")
      .lean();

    if (tags.length !== uniqueTagIds.length) {
      throw new ReferenceValidationError("One or more tags were not found.");
    }
  }

  return {
    client,
    projectIds: uniqueProjectIds,
    category,
    tagIds: uniqueTagIds,
  };
}

export class ReferenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReferenceValidationError";
  }
}
