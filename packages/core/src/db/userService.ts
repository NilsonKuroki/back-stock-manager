import { db, sql } from '@backend-stock-manager/core/src/db/connectDb'

export const createUser = async (value: any) => {
    try {
        const insertedUserId = await db
        .insertInto(`user`)
        .values({
          cognitoId: value.cognitoId,
          name: value.name,
          mobilePhone: value.mobilePhone,
          email: value.email,
          document: value.document,
          status: sql`${value.status}::status`
        })
        .returning(['id'])
        .executeTakeFirstOrThrow()

        return insertedUserId.id
    } catch (error) {
        throw error
    }
}

export const deleteUser = async (value: any) => {
    try {
        const deleteUser = await db
        .deleteFrom(`user`)
        .where("id", "=", value.id)
        .execute()

        return deleteUser
    } catch (error) {
        throw error
    }
}

export const getUser = async (value: any) => {
    try {
        const user = await db
        .selectFrom("user as u")
        .select('u.email')
        .where('u.email', '=', value.email)
        .executeTakeFirst()

        return user
    } catch (error) {
        throw error
    }
}