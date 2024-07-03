
export function errorHandler(errorCode) {

    switch(errorCode.code) {
        case "auth/email-already-exists":
            return "Потребител с този имейл вече съществува!";//The provided email is already in use by an existing user!
        case "auth/email-already-in-use":
            return "Потребител с този имейл вече съществува!";
        case "auth/invalid-argument":
            return "Невалидни данни";//Invalid argument
        case "auth/invalid-email":
            return "Невалиден имейл";//Invalid email
        case "auth/invalid-password":
            return "Невалидна парола";//Invalid password
        case "auth/weak-password":
            return "Паролата трябва да бъде най-малко 6 символа";//The password must be at least 6 characters
        case "auth/invalid-credential":
            return "Предоставените идентификационни данни за удостоверяване са неправилно формирани или са изтекли";//The supplied auth credential is malformed or has expired
        case "auth/too-many-requests":
            return "Достъпът до този акаунт е временно деактивиран поради много неуспешни опити за влизане. Можете незабавно да го възстановите, като нулирате паролата си, или можете да опитате отново по-късно.";//Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.
        default:
            return errorCode.message;
    }
}