"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetAllUsersParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import Tag, { ITag } from "@/database/tag.model";
import Question from "@/database/question.model";
import { FilterQuery } from "mongoose";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find interactions for the user and group by Tagss...
    // Interaction... for future feature

    return [
      {
        _id: "1",
        name: "tag1",
      },
      {
        _id: "2",
        name: "tag2",
      },
      {
        _id: "3",
        name: "tag3",
      },
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    connectToDatabase();

    const { searchQuery } = params;

    const query: FilterQuery<typeof Tag> = {};

    if (searchQuery) {
      query.$or = [{ tagName: { $regex: new RegExp(searchQuery, "i") } }];
    }

    const tags = await Tag.find(query);
    return { tags };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    connectToDatabase();

    const { tagId, page = 1, pageSize = 10, searchQuery } = params;
    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: "questionTags", model: Tag, select: "_id tagName" },
        {
          path: "user",
          model: User,
          select: "_id clerkId fullName profilePicture",
        },
      ],
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    const questions = tag.questions;
    return { tagTitle: tag.name, questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getPopularQuestionTags() {
  try {
    connectToDatabase();
    const popularQuestionTags = await Tag.aggregate([
      { $project: { tagName: 1, numberOfQuestions: { $size: "$questions" } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]); //showing the top 5 Tags with highest views and hightest upvotes in decending order
    return popularQuestionTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
