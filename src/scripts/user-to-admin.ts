import dataSource from "src/database/data-source";
import { User, UserRole } from "src/user/entities/user.entity";

async function runScript(username: string) {
    const source = await dataSource.initialize();
    const res = await source
        .getRepository(User)
        .createQueryBuilder("users")
        .update()
        .set({ role: UserRole.ADMIN })
        .where("username = :username", { username: username })
        .execute();
    if (res.affected > 0) {
        console.log(`Successfully updated user ${username} to admin status`);
        process.exit(0);
    } else {
        console.error(`No user found with username ${username}`);
        process.exit(1);
    }
}

if (!process.argv[2]) {
    console.error("No username specified");
} else {
    runScript(process.argv[2]);
}
