# <img src="https://raw.githubusercontent.com/Marucami/OPG-AND-MARUCAMI-PT/refs/heads/main/icons/linux/icon.png" alt="drawing" width="30"/> OPGM Task Manager


Состав команды:

1. Самоцкий Тимофей - Tech Lead/Frontend/Design Developer

2. Еларинов Данила - Frontend/Design Developer

3. Громов Илья - Backend Developer

4. Годовиков Фёдор - Database Developer

5. Ващенко Павел - QA Engineer

## Как развернуть проект

 1. Убедитесь что установлен NodeJS версии 23+ (Electron не поддерживает развертывание из WSL, используйте Windows CMD или Linux)
```bash
node --version # v23.11.0
```
2. Разверните проект командой
```bash
npm ci
```
3. Запустите приложение командой
```bash
npm run start
```
4. Для того чтобы скомпилировать приложение (Необходим установленный WiX Toolset)
```bash
npm run make
```
5. Для запуска тестов 
```bash
npm test
```
