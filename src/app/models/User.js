import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        phone: Sequelize.STRING,
        birth_date: Sequelize.DATEONLY,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        status: Sequelize.ENUM(['ACTIVE', 'INACTIVE', 'TESTER']),
        type: Sequelize.ENUM(['ADMIN', 'ORGANIZER', 'PLAYER']),
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
