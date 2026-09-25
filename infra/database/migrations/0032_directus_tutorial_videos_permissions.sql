DO $$
DECLARE
  has_policy_column boolean;
  has_role_column boolean;
  has_directus_policies boolean;
  has_roles_app_access boolean;
  has_roles_admin_access boolean;
  role_access_filter text := '';
BEGIN
  IF to_regclass('public.directus_permissions') IS NULL THEN
    RETURN;
  END IF;

  IF to_regclass('public.app_tutorial_videos') IS NULL THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'directus_permissions'
      AND column_name = 'policy'
  )
  INTO has_policy_column;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'directus_permissions'
      AND column_name = 'role'
  )
  INTO has_role_column;

  has_directus_policies := to_regclass('public.directus_policies') IS NOT NULL;

  IF has_policy_column THEN
    IF has_directus_policies THEN
      EXECUTE $sql$
        WITH source_policies AS (
          SELECT DISTINCT policy
          FROM directus_permissions
          WHERE collection = 'app_announcements'
            AND action IN ('read', 'create', 'update', 'delete')
            AND policy IS NOT NULL
          UNION
          SELECT id
          FROM directus_policies
          WHERE app_access = true
            OR admin_access = true
        ),
        desired_actions(action) AS (
          VALUES ('read'), ('create'), ('update'), ('delete')
        )
        INSERT INTO directus_permissions (
          policy,
          collection,
          action,
          permissions,
          validation,
          presets,
          fields
        )
        SELECT
          source_policies.policy,
          'app_tutorial_videos',
          desired_actions.action,
          '{}',
          '{}',
          '{}',
          '*'
        FROM source_policies
        CROSS JOIN desired_actions
        WHERE NOT EXISTS (
          SELECT 1
          FROM directus_permissions existing
          WHERE existing.policy = source_policies.policy
            AND existing.collection = 'app_tutorial_videos'
            AND existing.action = desired_actions.action
        )
      $sql$;
    ELSE
      EXECUTE $sql$
        WITH source_policies AS (
          SELECT DISTINCT policy
          FROM directus_permissions
          WHERE collection = 'app_announcements'
            AND action IN ('read', 'create', 'update', 'delete')
            AND policy IS NOT NULL
        ),
        desired_actions(action) AS (
          VALUES ('read'), ('create'), ('update'), ('delete')
        )
        INSERT INTO directus_permissions (
          policy,
          collection,
          action,
          permissions,
          validation,
          presets,
          fields
        )
        SELECT
          source_policies.policy,
          'app_tutorial_videos',
          desired_actions.action,
          '{}',
          '{}',
          '{}',
          '*'
        FROM source_policies
        CROSS JOIN desired_actions
        WHERE NOT EXISTS (
          SELECT 1
          FROM directus_permissions existing
          WHERE existing.policy = source_policies.policy
            AND existing.collection = 'app_tutorial_videos'
            AND existing.action = desired_actions.action
        )
      $sql$;
    END IF;

    EXECUTE $sql$
      WITH source_policies AS (
        SELECT DISTINCT policy
        FROM directus_permissions
        WHERE collection = 'app_tutorial_videos'
          AND action IN ('read', 'create', 'update', 'delete')
          AND policy IS NOT NULL
      )
      UPDATE directus_permissions dp
      SET fields = '*',
          permissions = '{}',
          validation = '{}',
          presets = '{}'
      FROM source_policies
      WHERE dp.policy = source_policies.policy
        AND dp.collection = 'app_tutorial_videos'
        AND dp.action IN ('read', 'create', 'update', 'delete')
    $sql$;

    RETURN;
  END IF;

  IF has_role_column THEN
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'directus_roles'
        AND column_name = 'app_access'
    )
    INTO has_roles_app_access;

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'directus_roles'
        AND column_name = 'admin_access'
    )
    INTO has_roles_admin_access;

    IF has_roles_app_access AND has_roles_admin_access THEN
      role_access_filter := 'UNION SELECT id FROM directus_roles WHERE app_access = true OR admin_access = true';
    ELSIF has_roles_app_access THEN
      role_access_filter := 'UNION SELECT id FROM directus_roles WHERE app_access = true';
    ELSIF has_roles_admin_access THEN
      role_access_filter := 'UNION SELECT id FROM directus_roles WHERE admin_access = true';
    END IF;

    EXECUTE '
      WITH source_roles AS (
        SELECT DISTINCT role
        FROM directus_permissions
        WHERE collection = ''app_announcements''
          AND action IN (''read'', ''create'', ''update'', ''delete'')
          AND role IS NOT NULL
        ' || role_access_filter || '
      ),
      desired_actions(action) AS (
        VALUES (''read''), (''create''), (''update''), (''delete'')
      )
      INSERT INTO directus_permissions (
        role,
        collection,
        action,
        permissions,
        validation,
        presets,
        fields
      )
      SELECT
        source_roles.role,
        ''app_tutorial_videos'',
        desired_actions.action,
        ''{}'',
        ''{}'',
        ''{}'',
        ''*''
      FROM source_roles
      CROSS JOIN desired_actions
      WHERE NOT EXISTS (
        SELECT 1
        FROM directus_permissions existing
        WHERE existing.role = source_roles.role
          AND existing.collection = ''app_tutorial_videos''
          AND existing.action = desired_actions.action
      )
    ';

    EXECUTE $sql$
      WITH source_roles AS (
        SELECT DISTINCT role
        FROM directus_permissions
        WHERE collection = 'app_tutorial_videos'
          AND action IN ('read', 'create', 'update', 'delete')
          AND role IS NOT NULL
      )
      UPDATE directus_permissions dp
      SET fields = '*',
          permissions = '{}',
          validation = '{}',
          presets = '{}'
      FROM source_roles
      WHERE dp.role = source_roles.role
        AND dp.collection = 'app_tutorial_videos'
        AND dp.action IN ('read', 'create', 'update', 'delete')
    $sql$;
  END IF;
END $$;
