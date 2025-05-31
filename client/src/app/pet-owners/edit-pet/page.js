"use client";
export const dynamic = 'force-dynamic'
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
"use client";
export const dynamic = 'force-dynamic'
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const petTypes = ["Dog", "Cat", "Other"];
const sexes = ["Male", "Female", "Unknown"];
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const petTypes = ["Dog", "Cat", "Other"];
const sexes = ["Male", "Female", "Unknown"];

export default function NotFound() {
  redirect("/");
  return null;
}