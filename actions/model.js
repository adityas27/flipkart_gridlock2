'use server';

import { currentUser } from "@clerk/nextjs/server";

export async function predictOutputFromModel() {
    try {
        const { user } = await currentUser();

        
    } catch (error) {
        
    }
}